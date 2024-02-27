import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { ChatPreviewBox } from "../components/ChatPreviewBox";
import { makePublicProfile, makeReceivedMessage, makeSentMessage } from "../../__testUtils__/easySetup";

export function Home() {
    return (
        <>
            <ChatPreviewBox
                chatPreview={{
                    profile: makePublicProfile("id"),
                    messages: [makeSentMessage()]
                }}
            />
            <ChatPreviewBox
                chatPreview={{
                    profile: makePublicProfile("id"),
                    messages: [makeReceivedMessage()]
                }}
            />
            <ChatPreviewBox
                chatPreview={{
                    profile: makePublicProfile("id"),
                    messages: [makeReceivedMessage("id",new Date(), false)]
                }}
            />
        </>
    )
}

export const HomeMob = observer(Home);