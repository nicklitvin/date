import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { chatText } from "../text";
import { useEffect, useState } from "react";
import { useStore } from "../store/RootStore";
import { GetChatInput, Message, MessageInput, PublicProfile, RequestReportInput } from "../interfaces";
import axios from "axios";
import { globals } from "../globals";
import { MyMessage } from "../components/message";
import { StyledButton, StyledScroll, StyledText, StyledView } from "../styledElements";
import { Image } from "expo-image";
import { testIDS } from "../testIDs";

interface Props {
    publicProfile: PublicProfile
    latestMessages: Message[]
    customNextChatLoad?: Message[]
    customGetChatLength?: (input : number) => number
}

export function Chat(props : Props) {
    const [chat, setChat] = useState<Message[]>(props.latestMessages ?? []);
    const { globalState } = useStore();

    useEffect( () => {
        if (props.customGetChatLength) {
            props.customGetChatLength(chat.length);
        }
    }, [chat])

    const sendMessage = async (sentMessage : string) => {
        const messageInput : MessageInput = {
            userID: globalState.userID!,
            recepientID: props.publicProfile.id,
            message: sentMessage
        }
        try {
            if (globalState.useHttp) {
                await axios.post(globals.URLServer + globals.URLSendMessage, messageInput);
            } else {
                globalState.setSentMessage(messageInput);
            }
        } catch (err) {}
    }

    const handleScroll = async () => {
        try {
            let moreChats : Message[];
            if (globalState.useHttp && chat.length > 0) {
                const input : GetChatInput = {
                    userID: globalState.userID!,
                    withID: props.publicProfile.id,
                    fromTime: chat.at(-1)!.timestamp
                }
                const response = await axios.post(
                    globals.URLServer + globals.URLGetChat, input
                );
                moreChats = response.data;
            } else {
                moreChats = props.customNextChatLoad!;
            }
            const uniqueMessages = new Set<Message>(moreChats.concat(chat));
            const orderedMessages = Array.from(uniqueMessages).sort( (a,b) => 
                a.timestamp.getTime() - b.timestamp.getTime()
            )
            setChat(orderedMessages);
        } catch (err) {
            console.log(err);
        }
    }

    const reportUser = async () => {
        try {
            const myReport : RequestReportInput = {
                userID: globalState.userID!,
                reportedID: props.publicProfile.id
            }
            if (globalState.useHttp) {
                await axios.post(globals.URLServer + globals.URLReportUser, myReport)
            } else {
                globalState.setLastReport(myReport)
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <>
            <StyledView>
                <Image
                    source={props.publicProfile.images[0]}
                />
                <StyledText>
                    {props.publicProfile.name}
                </StyledText>
                <StyledButton onPress={reportUser} testID={testIDS.reportUser}>
                </StyledButton>
            </StyledView>
            <StyledScroll 
                onScrollToTop={handleScroll}
                testID={testIDS.chatScroll}
                className="flex flex-row-reverse"
            >
                {chat.map( message => (
                    <MyMessage
                        key={message.id}
                        text={message.message}
                        invert={message.recepientID == globalState.userID}
                    />
                ))}        
            </StyledScroll>
            <MyTextInput
                placeholder={chatText.inputPlaceholder}
                errorMessage={chatText.inputError}
                afterSubmit={sendMessage}
            />  
        </>
    )
}

export const ChatMob = observer(Chat);