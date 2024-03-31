import { observer } from "mobx-react-lite";
import { MyTextInput } from "../src/components/TextInput";
import { chatText, generalText } from "../src/text";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../src/store/RootStore";
import { GetChatInput, GetProfileInput, Message, MessageInput, PublicProfile, RequestReportInput, SwipeInput, UnlikeInput, WithKey } from "../src/interfaces";
import { globals } from "../src/globals";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../src/styledElements";
import { testIDS } from "../src/testIDs";
import { getChatTimestamp, sendRequest } from "../src/utils";
import { PageHeader } from "../src/components/PageHeader";
import { MyMessage } from "../src/components/Message";
import { URLs } from "../src/urls";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { MyModal } from "../src/components/Modal";
import { differenceInSeconds } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";

interface Props {
    userID?: string
    getChatLength?: (input : number) => void
    noAutoLoad?: boolean
    getUnsentLength?: (input : number) => void
    returnSeconds?: (input : number) => void
}

export function Chat(props : Props) {
    const userID : string|undefined = props.userID ?? String(useLocalSearchParams().userID);
    const { globalState, receivedData } = useStore();

    if (!userID) router.back(); 

    const [profile, setProfile] = useState<PublicProfile>();
    const [chat, setChat] = useState<Message[]>(receivedData.savedChats[userID ?? ""] ?? []);
    const [lastSentChatID, setLastSentChatID] = useState<string>("");
    const scrollRef = useRef<ScrollView>(null);
    const [chatRequestTime, setChatRequestTime] = useState<Date>(new Date(0));
    const [sendingChats, setSendingChats] = useState<Message[]>([]);
    const [unsentChats, setUnsentChats] = useState<string[]>([]);
    const [currentID, setCurrentID] = useState<number>(0);
    const [loadingIDs, setLoadingIDs] = useState<string[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [seconds, setSeconds] = useState<number>(globals.chatRefreshSeconds);

    useEffect( () => {
        if (props.returnSeconds) props.returnSeconds(seconds);
        if (seconds == 0) {
            loadNewMessages()
            setSeconds(globals.chatRefreshSeconds);
            return;
        } else {
            const timer = setTimeout( () => setSeconds(seconds - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [seconds])

    useEffect( () => {
        if (props.getChatLength) props.getChatLength(chat.length);

        for (const message of chat) {
            if (!unsentChats.includes(message.id) && message.recepientID == profile?.id ) {
                setLastSentChatID(message.id);
                break;
            } 
        }

        const savedChat = receivedData.savedChats[userID!];
        if (!savedChat && chat.length > 0 || (savedChat && chat.length > savedChat.length)) {
            receivedData.addSavedChat(userID!,chat)
        }

    }, [chat,profile])

    useEffect( () => {
        if (props.getUnsentLength) props.getUnsentLength(unsentChats.length)
    }, [unsentChats])

    useEffect( () => {
        if (firstLoad) {
            if (props.noAutoLoad) return
            load();
            scrollRef.current?.scrollToEnd({animated: true});
        }
        setFirstLoad(false);
    })

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
    }

    const load = async () => {
        const newMatch = receivedData.newMatches && receivedData.newMatches.find(val => val.profile.id == userID)?.profile;
        const existMatch = receivedData.chatPreviews && receivedData.chatPreviews.find(val => val.profile.id == userID)?.profile;

        if (newMatch || existMatch) {
            setProfile(newMatch || existMatch || undefined)
        } else {
            await getProfile();
        }

        if (!receivedData.savedChats[userID]) {
            await getChat();
        }
    }

    const getProfile = async () => {
        try {
            const profileInput : GetProfileInput = {
                userID: userID!
            }
            const profileResponse = await sendRequest(URLs.getProfile, profileInput);
            setProfile(profileResponse.data.data);    
        } catch (err) {
            console.log(err);
        }
    }

    const getChat = async () => {
        try {
            const chatInput : WithKey<GetChatInput> = {
                key: receivedData.loginKey,
                fromTime: new Date(),
                withID: userID!
            }
            const chatResponse = await sendRequest(URLs.getChat, chatInput);
            const chatData = chatResponse.data.data as Message[];
            const processedChatData = chatData.map( val => ({
                ...val,
                timestamp: new Date(val.timestamp)
            }));
            setChat(processedChatData);
        } catch (err) {
            console.log(err);
        }
    }

    const sendMessage = async (sentMessage : string, removeID?: string) => {
        const sendingID = String(currentID);
        setCurrentID(currentID + 1);

        const sendingChat : Message = {
            id: sendingID,
            message: sentMessage,
            readStatus: false,
            recepientID: profile!.id,
            timestamp: new Date(),
            userID: ""
        }
        setLoadingIDs(loadingIDs.concat(sendingID));
        setChat([sendingChat].concat(chat.filter( val => val.id != removeID)));

        try {
            const withKeyMessage : WithKey<Message> = {
                ...sendingChat,
                key: receivedData.loginKey
            }
            const response = await sendRequest(URLs.sendMessage, withKeyMessage);
            const message = response.data.data as Message;

            const copy = [...chat];
            const index = chat.findIndex( val => val.id == sendingID);
            copy[index] = message;

            setSendingChats(sendingChats.filter( val => val.id != sendingID));
            setUnsentChats(unsentChats.filter(val => val != removeID));

        } catch (err) {
            setUnsentChats(unsentChats.filter(val => val != removeID).concat(sendingID))
        }
        setLoadingIDs(loadingIDs.filter( val => val != sendingID))
    }

    const handleScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const scrollHeight = contentSize.height - layoutMeasurement.height;
        const isAtTop = contentOffset.y <= scrollHeight * (1-globals.scrollAtPercentage);
        const canSend = differenceInSeconds(new Date(), chatRequestTime) > globals.apiRequestTimeout;

        if (!(isAtTop && canSend)) return 
        setChatRequestTime(new Date());
        
        try {
            let moreChats : Message[];
            if (chat.length == 0) return

            const input : WithKey<GetChatInput> = {
                key: receivedData.loginKey,
                withID: profile!.id,
                fromTime: new Date(chat.at(-1)!.timestamp.getTime() - 1)
            }

            const response = await sendRequest(URLs.getChat, input);
            moreChats = response.data.data as Message[];
            moreChats = moreChats.map( message => ({
                ...message, 
                timestamp: new Date(message.timestamp)
            }))

            setChat(chat.concat(moreChats));
        } catch (err) {
        }
    }

    const loadNewMessages = async () => {
        try {
            const input : WithKey<GetChatInput> = {
                fromTime: new Date(),
                withID: userID,
                key: receivedData.loginKey!
            }
            const chatResponse = await sendRequest(URLs.getChat, input);
            const chatData = chatResponse.data.data as Message[];
            const processedChatData = chatData.map( val => ({
                ...val,
                timestamp: new Date(val.timestamp)
            }));
            const newMessages = processedChatData.filter( 
                val => val.timestamp.getTime() > chat[0]?.timestamp.getTime() ?? new Date(0).getTime()
            )
            setChat(newMessages.concat(chat));
        } catch (err) {
            console.log(err);
        }
    }

    const reportUser = async () => {
        try {
            setShowModal(false);
            const myReport : WithKey<RequestReportInput> = {
                key: receivedData.loginKey,
                reportedID: profile!.id
            }
            await sendRequest(URLs.reportUser, myReport);
            deleteUser();
            if (props.noAutoLoad) return
            router.push("Matches");
        } catch (err) {
            console.log(err);
        }
    }

    const unlikeUser = async () => {
        try {
            setShowModal(false);
            const unlike : WithKey<UnlikeInput> = {
                key: receivedData.loginKey,
                withID: profile!.id
            }
            await sendRequest(URLs.unlikeUser, unlike);
            deleteUser();
            if (props.noAutoLoad) return
            router.push("Matches");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledView className="w-full h-full bg-back">
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
            <StyledButton testID={testIDS.load} onPress={load}/>
            <StyledButton testID={testIDS.loadNew} onPress={loadNewMessages}/>
            <PageHeader
                imageSource={profile?.images[0]}
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
                {
                    chat.length == 0 ?
                    <StyledText className="pb-[400px] items-center font-bold text-center text-xl">
                        {chatText.sendFirst}
                    </StyledText> : null
                }
                <StyledScroll 
                    onScroll={handleScroll}
                    testID={testIDS.chatScroll}
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    ref={scrollRef}
                >
                    <StyledView className="flex flex-col-reverse">
                        {chat.map( (message, index) => (
                            <StyledView 
                                className="pb-1"
                                key={`view-${message.id}`}
                            >
                                {
                                    (
                                        index == chat.length - 1 || 
                                        message.timestamp.getTime() - chat[index + 1].timestamp.getTime() >
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
                                        error={unsentChats.includes(message.id)}
                                        onPress={unsentChats.includes(message.id) ? 
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
                                                unsentChats.includes(message.id) ? chatText.unsent :
                                                (
                                                    loadingIDs.includes(message.id) ? chatText.sending : (
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
        </StyledView>
    )
}

export const ChatMob = observer(Chat);
export default ChatMob;