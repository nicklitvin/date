import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { ChatPreviewBox } from "../components/ChatPreviewBox";
import { makePublicProfile, makeReceivedMessage, makeSentMessage } from "../../__testUtils__/easySetup";
import { PageHeader } from "../components/PageHeader";
import { StyledImage, StyledView } from "../styledElements";
import { Picture } from "../components/Picture";
import { useState } from "react";

export function Home() {
    const [x, setX] = useState<boolean>(false);
    return (
        <>
            {/* <Picture
                source="https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                onPress={()=> {setX(!x)}}
                onRemove={()=>{}}
                switching={x}
            />
            <Picture
                source="https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                onPress={()=>{}}
                onRemove={()=>{}}
                switching={true}
            /> */}
            {/* <PageHeader
                title="Page"
                imageSource=""
                imageType="SendTriangle"
            />
            <PageHeader
                title="Page"
                imageSource=""
                imageType="SendTriangle"
                swapTitleAndImage={true}
            />
            <PageHeader
                title="Page"
                imageSource="https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                swapTitleAndImage={true}
            />
            <PageHeader
                title="Page"
                imageSource="https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                swapTitleAndImage={true}
                rightContent={
                    <StyledImage
                        className="w-[20px] h-[20px]"
                        source={require("../../assets/SendTriangle.png")}
                    />
                }
            /> */}

            {/* <ChatPreviewBox
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
            /> */}
        </>
    )
}

export const HomeMob = observer(Home);