import { observer } from "mobx-react-lite";
import { MyTextInput } from "../src/components/TextInput";
import { chatText, generalText } from "../src/text";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../src/store/RootStore";
import { GetChatInput, Message, MessageInput, PublicProfile, UserReportWithReportedID, SwipeInput, UnlikeInput, WithKey, ReadStatusInput, GetReadStatusInput, JustUserID, APIOutput } from "../src/interfaces";
import { globals } from "../src/globals";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../src/styledElements";
import { testIDS } from "../src/testIDs";
import { getChatTimestamp, sendRequest, setCustomTimer } from "../src/utils";
import { PageHeader } from "../src/components/PageHeader";
import { MyMessage } from "../src/components/Message";
import { URLs } from "../src/urls";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { MyModal } from "../src/components/Modal";
import { differenceInSeconds } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { randomUUID } from "expo-crypto";
import Loading from "./Loading";
import Toast from "react-native-toast-message";
import { toastConfig } from "../src/components/Toast";
import classNames from "classnames";

interface Props {
    userID?: string
    noAutoLoad?: boolean
    noRouter?: boolean
}

export function Chat(props : Props) {
    const userID : string|undefined = props.userID ?? String(useLocalSearchParams().userID);
    if (!userID) router.back(); 

    const { globalState, receivedData } = useStore();
    const chat = receivedData.savedChats[userID];
    const unsentMessageIDs = globalState.unsentMessageIDs;
    const loadingMessageIDs = globalState.loadingMessageIDs;

    const [profile, setProfile] = useState<PublicProfile|undefined>( 
        receivedData.newMatches?.find(val => val.profile.id == userID)?.profile ||
        receivedData.chatPreviews?.find(val => val.profile.id == userID)?.profile   
    )

    const [lastSentChatID, setLastSentChatID] = useState<string|undefined>();
    const scrollRef = useRef<ScrollView>(null);
    const [chatRequestTime, setChatRequestTime] = useState<Date>(new Date(0));
    const [showModal, setShowModal] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [initialLoad, setInitialLoad] = useState<boolean>(true);

    useEffect( () => {
        if (!chat || !globalState.socketManager || !receivedData.profile) return

        for (const message of chat) {
            if (!unsentMessageIDs.has(message.id) && message.recepientID == userID) {
                setLastSentChatID(message.id);
                break;
            } 
        }
        if (chat.length > 0 && chat[0].userID == userID) updateMyReadStatus();
        
    }, [chat, profile, globalState.socketManager])

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);

            if (!props.noAutoLoad) {
                load();
                scrollRef.current?.scrollToEnd({animated: false});
                setInitialLoad(false);
            }
            updateMyReadStatus();
        }
    }, [firstLoad])

    const updateMyReadStatus = async () => {
        if (!globalState.socketManager || !receivedData.profile) return 

        if (receivedData.chatPreviews) {
            const copy = [...receivedData.chatPreviews];
            const index = copy.findIndex(val => val.profile.id == userID);
            if (index > -1 && copy[index].message.userID == userID) {
                copy[index].message.readStatus = true;
                receivedData.setChatPreviews(copy);
            }
        }

        globalState.socketManager.sendData({
            readUpdate: {
                userID: receivedData.profile.id,
                timestamp: new Date(),
                toID: userID
            }
        })
    }

    const deleteUser = () => {
        receivedData.deleteSavedChat(userID);
        if (receivedData.newMatches) {
            receivedData.setNewMatches(
                receivedData.newMatches.filter( val => val.profile.id != userID)
            )
        }
        if (receivedData.chatPreviews) {
            receivedData.setChatPreviews(
                receivedData.chatPreviews.filter( val => val.profile.id != userID)
            );
        }

        if (!props.noRouter) router.back();
    }

    const load = async () => {
        if (!chat) await getChat()
        if (!profile) await getProfile();
    }

    const getProfile = async () => {
        try {
            const profileInput : JustUserID = {
                userID: userID!
            }
            const profileResponse = await sendRequest<PublicProfile>(URLs.getProfile, profileInput);
            setProfile(profileResponse.data);    
        } catch (err) {
            console.log(err);
        }
    }

    const getChat = async (loadMoreFromTime?: Date) => {
        console.log("get chat");
        try {
            const chatInput : WithKey<GetChatInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                fromTime: loadMoreFromTime || new Date(),
                withID: userID!
            }
            const chatResponse = await sendRequest<Message[]>(URLs.getChat, chatInput);
            if (chatResponse.message) {
                Toast.show({
                    text1: chatText.errorCannotGetChat,
                    text2: chatResponse.message
                })
            } else if (chatResponse.data) {
                const processed = chatResponse.data.map( val => ({
                    ...val,
                    timestamp: new Date(val.timestamp)
                }));
                if (loadMoreFromTime) {
                    receivedData.addSavedChat(userID, chat.concat(processed) )
                } else {
                    receivedData.addSavedChat(userID, processed);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    const sendMessage = async (sentMessage : string, removeID?: string) => {
        if (!globalState.socketManager || !receivedData.profile || !profile) {
            Toast.show({
                type: "error",
                text1: chatText.errorCannotSend
            })
            return 
        }

        const newMessageID = `loading-${randomUUID()}`
        const sendingChat : Message = {
            id: newMessageID,
            message: sentMessage,
            readStatus: false,
            recepientID: profile.id,
            timestamp: new Date(),
            userID: receivedData.profile.id
        }

        globalState.addLoadingMessageID(newMessageID);
        if (removeID) {
            globalState.removeUnsentMessageID(removeID);
            receivedData.deleteMessageFromChat(userID, removeID);
        }

        receivedData.addSavedChat(
            userID, 
            [sendingChat].concat(receivedData.savedChats[userID])
        );

        globalState.socketManager.sendData({
            payloadID: newMessageID,
            message: {
                userID: receivedData.profile.id,
                message: sentMessage,
                recepientID: profile.id
            }
        })

        setCustomTimer( () => {
            if (!globalState.socketManager) return 

            const message = globalState.socketManager.wasMessageProcessed(newMessageID);
            if (message) {
                globalState.socketManager.updateChatWithMessage(message);
            } else {
                globalState.addUnsentMessageID(newMessageID);
                globalState.socketManager.reconnect();
            }
            globalState.removeLoadingMessageID(newMessageID);
        }, 1)
    }

    const handleScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const scrollHeight = contentSize.height - layoutMeasurement.height;

        const isAtTop = contentOffset.y <= scrollHeight * (1-globals.scrollAtPercentage);
        const canSend = differenceInSeconds(new Date(), chatRequestTime) > globals.apiRequestTimeout;

        if (!(isAtTop && canSend && !initialLoad && chat.length > 0)) return 
        setChatRequestTime(new Date());
        getChat(new Date(chat.at(-1)!.timestamp.getTime() - 1))
    }

    const reportUser = async () => {
        try {
            setShowModal(false);
            const myReport : WithKey<UserReportWithReportedID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                reportedID: profile!.id
            }
            const response = await sendRequest(URLs.reportUser, myReport);
            if (response.message) {
                Toast.show({
                    type: "error",
                    text1: response.message
                })
            } else {
                deleteUser();
            }
        } catch (err) {
            console.log(err);
        }
    }

    const unlikeUser = async () => {
        try {
            setShowModal(false);
            const unlike : WithKey<UnlikeInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                withID: profile!.id
            }

            const response = await sendRequest(URLs.unlikeUser, unlike);
            if (response.message) {
                Toast.show({
                    type: "error",
                    text1: response.message
                })
            } else {
                deleteUser();
            }
        } catch (err) {
            console.log(err);
        }
    }

    if (!chat || !profile) {
        return (
            <>
                <StyledButton testID={testIDS.load} onPress={load}/>
                <Loading/>
            </>
        )
    }
    return (
        <StyledView className="w-full h-full bg-back">
        <StyledButton testID={testIDS.load} onPress={updateMyReadStatus}/>
        <MyModal
            show={showModal}
            buttons={[
                {
                    text: chatText.modalReport,
                    danger: true,
                    function: reportUser
                },
                {
                    text: chatText.modalUnlike,
                    danger: false,
                    function: unlikeUser
                },
                {
                    text: generalText.cancel,
                    danger: false,
                    function: () => setShowModal(false)
                }
            ]}
            text={chatText.modalTitle}
            cancelButtonIndex={2}
        />
        <StyledView className="w-full h-full">
            <PageHeader
                imageSource={profile?.images[0]?.url}
                title={profile?.name ?? ""}
                swapTitleAndImage={true}
                rightContent={
                    <StyledButton onPress={() => setShowModal(true)} testID={testIDS.reportUser}>
                        <StyledImage
                            source={require("../assets/Report.png")}
                            alt=""
                            className="w-[35px] h-[35px]"
                        />
                    </StyledButton>    
                }
                imageLink={`/ProfileView?userID=${profile?.id}`}
            />
            <StyledView className="flex flex-grow flex-col-reverse pb-3 px-2">
                <StyledView className="pt-2">
                    <MyTextInput
                        placeholder={chatText.inputPlaceholder}
                        onSubmit={sendMessage}
                        newLine={true}
                    />  
                </StyledView>

                <StyledScroll 
                    onScroll={handleScroll}
                    testID={testIDS.chatScroll}
                    showsVerticalScrollIndicator={false}
                    className={classNames(
                        initialLoad ? "opacity-0" : "opacity-100",
                        "flex-1"
                    )}
                    ref={scrollRef}
                >
                    {
                        chat.length == 0 ?
                        <StyledText className="pt-[200px] items-center font-bold text-center text-xl">
                            {chatText.sendFirst}
                        </StyledText> : null
                    }
                    <StyledView className="flex flex-col-reverse">
                        {chat.map( (message, index) => (
                            <StyledView 
                                className="pb-1"
                                key={`view-${message.id}`}
                            >
                                {
                                    (
                                        index == receivedData.savedChats[userID].length - 1 || 
                                        message.timestamp.getTime() - receivedData.savedChats[userID][index + 1].timestamp.getTime() >
                                        globals.timeBeforeChatTimestamp 
                                    ) ? 
                                    <StyledText className="text-sm text-center m-1">
                                        {getChatTimestamp(message.timestamp, globalState.timeZone!)}
                                    </StyledText> : 
                                    null
                                }
                                <StyledView>
                                    <MyMessage
                                        text={message.message}
                                        invert={message.userID == profile?.id}
                                        error={unsentMessageIDs.has(message.id)}
                                        onPress={unsentMessageIDs.has(message.id) ? 
                                            () => sendMessage(message.message, message.id) :
                                            () => {}
                                        }
                                    />
                                </StyledView>
                                {
                                    message.id == lastSentChatID ?
                                    <StyledView className="w-full flex items-end pr-1">
                                        <StyledText 
                                            testID={`readStatus-${message.id}`}
                                        >
                                            {
                                                unsentMessageIDs.has(message.id) ? chatText.unsent :
                                                (
                                                    loadingMessageIDs.has(message.id) ? chatText.sending : (
                                                        message.readStatus ? chatText.read : chatText.delivered
                                                    )
                                                )
                                            }
                                        </StyledText>
                                    </StyledView> : null
                                }
                            </StyledView>
                        ))}        
                    </StyledView>
                </StyledScroll>
            </StyledView>
        </StyledView>
        <Toast config={toastConfig}/>
        </StyledView>
    )
}

export const ChatMob = observer(Chat);
export default ChatMob;