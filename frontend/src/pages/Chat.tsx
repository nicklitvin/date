import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { chatText } from "../text";
import { useEffect, useState } from "react";
import { useStore } from "../store/RootStore";
import { Message, MessageInput, PublicProfile } from "../interfaces";
import axios from "axios";
import { globals } from "../globals";
import { MyMessage } from "../components/message";
import { StyledText, StyledView } from "../styledElements";
import { Image } from "expo-image";

interface Props {
    publicProfile: PublicProfile
    latestMessages: Message[]
}

export function Chat(props : Props) {
    const [chat, setChat] = useState<Message[]>(props.latestMessages ?? []);
    const { globalState } = useStore();

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
        } catch (err) {

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
            </StyledView>
            {chat.map( message => (
                <MyMessage
                    text={message.message}
                    invert={message.recepientID == globalState.userID}
                />
            ))}        
            <MyTextInput
                placeholder={chatText.inputPlaceholder}
                errorMessage={chatText.inputError}
                afterSubmit={sendMessage}
            />  
        </>
    )
}

export const ChatMob = observer(Chat);