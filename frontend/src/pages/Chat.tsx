import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { chatText } from "../text";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/RootStore";
import { GetChatInput, Message, MessageInput, PublicProfile, RequestReportInput } from "../interfaces";
import axios from "axios";
import { globals } from "../globals";
import { StyledButton, StyledScroll, StyledText, StyledView } from "../styledElements";
import { testIDS } from "../testIDs";
import { getChatTimestamp } from "../utils";
import { PageHeader } from "../components/PageHeader";
import { MyMessage } from "../components/Message";
import { URLs } from "../urls";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";

interface Props {
    publicProfile: PublicProfile
    latestMessages: Message[]
    returnChatLength?: (input : number) => number
}

export function Chat(props : Props) {
    const [chat, setChat] = useState<Message[]>(props.latestMessages ?? []);
    const [lastSentChatID, setLastSentChatID] = useState<string>("");
    const { globalState } = useStore();
    const scrollRef = useRef<ScrollView>(null);
    const [gettingChat, setGettingChat] = useState<boolean>(false);

    useEffect( () => {
        if (chat.length == 0) return

        if (chat[0].userID == props.publicProfile.id) return

        if (chat[0].recepientID == props.publicProfile.id) {
            setLastSentChatID(chat[0].id)
        }

        if (props.returnChatLength) {
            props.returnChatLength(chat.length);
        }
    }, [chat])

    useEffect( () => {
        scrollRef.current?.scrollToEnd({animated: true});
    }, [])

    const sendMessage = async (sentMessage : string) => {
        const messageInput : MessageInput = {
            recepientID: props.publicProfile.id,
            message: sentMessage
        }
        try {
            const endpoint = URLs.server + URLs.sendMessage;
            const response = await axios.post(endpoint, messageInput);
        } catch (err) {}
    }

    const handleScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (event.nativeEvent.contentOffset.y > 0 || gettingChat) return  
        setGettingChat(true);
        
        try {
            let moreChats : Message[];
            if (chat.length == 0) return

            const input : GetChatInput = {
                withID: props.publicProfile.id,
                fromTime: new Date(chat.at(-1)!.timestamp.getTime() - 1)
            }

            const response = await axios.post(URLs.server + URLs.getChat, input);
            moreChats = response.data.data as Message[];
            moreChats = moreChats.map( message => ({
                ...message, 
                timestamp: new Date(message.timestamp)
            }))

            setChat(chat.concat(moreChats));
        } catch (err) {
            console.log(err);
        }
        setGettingChat(false);
    }

    const reportUser = async () => {
        try {
            const myReport : RequestReportInput = {
                reportedID: props.publicProfile.id
            }
            await axios.post(URLs.server + URLs.reportUser, myReport)
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledView className="w-full h-full">
            <PageHeader
                imageSource={props.publicProfile.images[0]}
                title={props.publicProfile.name}
                swapTitleAndImage={true}
                rightContent={
                    <StyledButton onPress={reportUser} testID={testIDS.reportUser}>
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
                    <StyledView className="flex flex-col-reverse ">
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
                                        text={message.message + (message.id == lastSentChatID ? "hi" : "")}
                                        invert={message.userID == props.publicProfile.id}
                                    />
                                </StyledView>
                                {
                                    message.id == lastSentChatID ?
                                    <StyledView className="w-full flex items-end pr-1">
                                        <StyledText 
                                            testID={`readStatus-${message.id}`}
                                        >
                                            {message.readStatus ? chatText.read : chatText.delivered}
                                        </StyledText>
                                    </StyledView> : null
                                }
                            </StyledView>
                        ))}        
                    </StyledView>
                </StyledScroll>
            </StyledView>
        </StyledView>
    )
}

export const ChatMob = observer(Chat);