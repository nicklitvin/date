import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { chatText, generalText } from "../text";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/RootStore";
import { GetChatInput, Message, MessageInput, PublicProfile, RequestReportInput, SwipeInput, UnlikeInput } from "../interfaces";
import axios from "axios";
import { globals } from "../globals";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../styledElements";
import { testIDS } from "../testIDs";
import { createTimeoutSignal, getChatTimestamp } from "../utils";
import { PageHeader } from "../components/PageHeader";
import { MyMessage } from "../components/Message";
import { URLs } from "../urls";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { MyModal } from "../components/Modal";
import { differenceInSeconds } from "date-fns";

interface Props {
    publicProfile: PublicProfile
    latestMessages: Message[]
    returnChatLength?: (input : number) => number
    returnUnsentChatLength?: (input : number) => any
}

export function Chat(props : Props) {
    const [chat, setChat] = useState<Message[]>(props.latestMessages ?? []);
    const [lastSentChatID, setLastSentChatID] = useState<string>("");
    const { globalState } = useStore();
    const scrollRef = useRef<ScrollView>(null);
    const [chatRequestTime, setChatRequestTime] = useState<Date>(new Date(0));
    const [sendingChats, setSendingChats] = useState<Message[]>([]);
    const [unsentChats, setUnsentChats] = useState<string[]>([]);
    const [currentID, setCurrentID] = useState<number>(0);
    const [loadingIDs, setLoadingIDs] = useState<string[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect( () => {
        if (props.returnUnsentChatLength) props.returnUnsentChatLength(unsentChats.length);
    }, [unsentChats])

    useEffect( () => {
        if (chat.length == 0) return

        if (chat[0].userID == props.publicProfile.id) return

        for (const message of chat) {
            if (!unsentChats.includes(message.id) && message.recepientID == props.publicProfile.id ) {
                setLastSentChatID(message.id);
                break;
            } 
        }

        if (props.returnChatLength) {
            props.returnChatLength(chat.length);
        }
    }, [chat])

    useEffect( () => {
        scrollRef.current?.scrollToEnd({animated: true});
    }, [])

    const sendMessage = async (sentMessage : string, removeID?: string) => {
        const messageInput : MessageInput = {
            recepientID: props.publicProfile.id,
            message: sentMessage
        }

        const sendingID = String(currentID);
        setCurrentID(currentID + 1);

        const sendingChat : Message = {
            id: sendingID,
            message: sentMessage,
            readStatus: false,
            recepientID: props.publicProfile.id,
            timestamp: new Date(),
            userID: ""
        }
        setLoadingIDs(loadingIDs.concat(sendingID));
        setChat([sendingChat].concat(chat.filter( val => val.id != removeID)));

        try {
            const endpoint = URLs.server + URLs.sendMessage;
            const response = await axios.post(endpoint, messageInput);
            const message = response.data as Message;

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

            const input : GetChatInput = {
                withID: props.publicProfile.id,
                fromTime: new Date(chat.at(-1)!.timestamp.getTime() - 1)
            }

            const response = await axios.post(URLs.server + URLs.getChat, input, {
                signal: createTimeoutSignal()
            });
            moreChats = response.data.data as Message[];
            moreChats = moreChats.map( message => ({
                ...message, 
                timestamp: new Date(message.timestamp)
            }))

            setChat(chat.concat(moreChats));
        } catch (err) {
        }
    }

    const reportUser = async () => {
        try {
            setShowModal(false);
            const myReport : RequestReportInput = {
                reportedID: props.publicProfile.id
            }
            await axios.post(URLs.server + URLs.reportUser, myReport)
        } catch (err) {
            console.log(err);
        }
    }

    const unlikeUser = async () => {
        try {
            setShowModal(false);
            const unlike : UnlikeInput = {
                withID: props.publicProfile.id
            }
            await axios.post(URLs.server + URLs.unlikeUser, unlike);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <>
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
                imageSource={props.publicProfile.images[0]}
                title={props.publicProfile.name}
                swapTitleAndImage={true}
                rightContent={
                    <StyledButton onPress={() => setShowModal(true)} testID={testIDS.reportUser}>
                        <StyledImage
                            source={require("../../assets/Report.png")}
                            alt=""
                            className="w-[35px] h-[35px]"
                        />
                    </StyledButton>    
                }
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
                                        invert={message.userID == props.publicProfile.id}
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
        </>
    )
}

export const ChatMob = observer(Chat);