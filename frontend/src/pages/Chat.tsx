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
    returnChatLength?: (input : number) => number
}

export function Chat(props : Props) {
    const [chat, setChat] = useState<Message[]>(props.latestMessages ?? []);
    const [lastSentChatID, setLastSentChatID] = useState<string>("");
    const { globalState } = useStore();

    useEffect( () => {
        for (const message of [...chat].reverse()) {
            if (message.recepientID == props.publicProfile.id) {
                setLastSentChatID(message.id)
            }
        }
        if (props.returnChatLength) {
            props.returnChatLength(chat.length);
        }
    }, [chat])

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

    const handleScroll = async () => {
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
                onSubmit={sendMessage}
            />  
        </StyledView>
    )
}

export const ChatMob = observer(Chat);