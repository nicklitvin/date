import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { chatText } from "../text";
import { useEffect, useState } from "react";
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

interface Props {
    publicProfile: PublicProfile
    latestMessages: Message[]
    customNextChatLoad?: Message[]
    customGetChatLength?: (input : number) => number
}

export function Chat(props : Props) {
    const [chat, setChat] = useState<Message[]>(props.latestMessages ?? []);
    const [lastSentChatID, setLastSentChatID] = useState<string>("");
    const { globalState, savedAPICalls } = useStore();

    useEffect( () => {
        for (const message of [...chat].reverse()) {
            if (message.recepientID == props.publicProfile.id) {
                setLastSentChatID(message.id)
            }
        }
        if (props.customGetChatLength) {
            props.customGetChatLength(chat.length);
        }
    }, [chat])

    const sendMessage = async (sentMessage : string) => {
        const messageInput : MessageInput = {
            recepientID: props.publicProfile.id,
            message: sentMessage
        }
        try {
            const endpoint = URLs.server + URLs.sendMessage;
            if (globalState.useHttp) {
                await axios.post(endpoint, messageInput);
            } else {
                savedAPICalls.setSentMessage(messageInput);
            }
        } catch (err) {}
    }

    const handleScroll = async () => {
        try {
            let moreChats : Message[];
            if (chat.length == 0) return

            const input : GetChatInput = {
                withID: props.publicProfile.id,
                fromTime: new Date(chat.at(-1)!.timestamp.getTime() - 1)
            }

            if (globalState.useHttp) {
                const response = await axios.post(URLs.server + URLs.getChat, input);
                moreChats = response.data;
            } else {
                savedAPICalls.setGetChatInput(input);
                moreChats = props.customNextChatLoad!;
            }

            setChat(chat.concat(moreChats));
        } catch (err) {
            console.log(err);
        }
    }

    const reportUser = async () => {
        try {
            const myReport : RequestReportInput = {
                reportedID: props.publicProfile.id
            }
            if (globalState.useHttp) {
                await axios.post(URLs.server + URLs.reportUser, myReport)
            } else {
                savedAPICalls.setRequestReportInput(myReport)
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledView>
            <PageHeader
                imageSource={props.publicProfile.images[0]}
                title={props.publicProfile.name}
                swapTitleAndImage={true}
                rightContent={
                    <StyledButton onPress={reportUser} testID={testIDS.reportUser}>
                    </StyledButton>    
                }
            />
            <StyledScroll 
                onScrollToTop={handleScroll}
                testID={testIDS.chatScroll}
            >
                {chat.map( (message, index) => (
                    <StyledView key={`view-${message.id}`}>
                        {
                            (
                                index == chat.length - 1 || 
                                message.timestamp.getTime() - chat[index + 1].timestamp.getTime() >
                                globals.timeBeforeChatTimestamp
                            ) ? 
                            <StyledText>
                                {getChatTimestamp(message.timestamp, globalState.timeZone!)}
                            </StyledText> : 
                            null
                        }
                        <MyMessage
                            text={message.message}
                            invert={message.userID == props.publicProfile.id}
                        />
                        {
                            message.id == lastSentChatID ?
                            <StyledText testID={`readStatus-${message.id}`}>
                                {message.readStatus ? chatText.read : chatText.delivered}
                            </StyledText> : null
                        }
                    </StyledView>
                ))}        
            </StyledScroll>
            <MyTextInput
                placeholder={chatText.inputPlaceholder}
                errorMessage={chatText.inputError}
                afterSubmit={sendMessage}
            />  
        </StyledView>
    )
}

export const ChatMob = observer(Chat);