import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";
import { ChatPreviewBox } from "../components/ChatPreviewBox";
import { makePublicProfile, makeReceivedMessage, makeSentMessage } from "../../__testUtils__/easySetup";
import { PageHeader } from "../components/PageHeader";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../styledElements";
import { Picture } from "../components/Picture";
import { useState } from "react";
import { MySimplePage } from "../components/SimplePage";
import { MyButton } from "../components/Button";
import { AccountCreationMob } from "./AccountCreation";
import { MyName } from "../simplePages/MyName";
import { Pictures } from "../simplePages/Pictures";
import { Chat } from "./Chat";
import { Message, PublicProfile } from "../interfaces";
import { Attributes } from "./Attributes";
import { ScrollView } from "react-native";
import { globals } from "../globals";
import { MyModal } from "../components/Modal";

const myUserID = "userID";

const recepientProfile : PublicProfile = {
    name: "Michael",
    age: 21,
    attributes: [],
    description: "",
    gender: "Male",
    id: "abc",
    images: ["https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"],
}
const latestMessages : Message[] = [
    {
        id: "id",
        message: "hi",
        readStatus: true,
        recepientID: recepientProfile.id,
        timestamp: new Date(Date.UTC(2000, 0, 1, 8, 1)),
        userID: myUserID
    },
    {
        id: "id1",
        message: "hey",
        readStatus: true,
        recepientID: myUserID,
        timestamp: new Date(Date.UTC(2000, 0, 1, 8, 0)),
        userID: recepientProfile.id
    },
]


export function Home() {
    const [x, setX] = useState<boolean>(false);
    const messages : Message[] = Array.from({length: 20}).map( (val,index) => ({
        id: String(20-index),
        message: index % 3 == 0 ? `${20-index}` : `${20-index}`,
        readStatus: true,
        recepientID: index % 2 == 0 ? recepientProfile.id : "me",
        timestamp: new Date(2000,0,1,0,20-index),
        userID: index % 2 != 0 ? recepientProfile.id : "me"
    }))
    const latestMessages : Message[] = [
        {
            id: "id",
            message: "hi",
            readStatus: true,
            recepientID: recepientProfile.id,
            timestamp: new Date(Date.UTC(2000, 0, 1, 8, 1)),
            userID: myUserID
        },
        {
            id: "id1",
            message: "hey",
            readStatus: true,
            recepientID: myUserID,
            timestamp: new Date(Date.UTC(2000, 0, 1, 8, 0)),
            userID: recepientProfile.id
        },
        {
            id: "id2",
            message: "sooo",
            readStatus: false,
            recepientID: recepientProfile.id,
            timestamp: new Date(Date.UTC(2000, 0, 1, 6, 0)),
            userID: myUserID
        } 
    ]

    return (
        <>
            <Chat
                latestMessages={latestMessages}
                publicProfile={recepientProfile}
            />
            
            {/* <Pictures
                onSubmit={() => {}}
                submitText="submit"
                uploads={[]}
            /> */}
            {/* <MyTextInput errorMessage="a" onSubmit={() => {console.log("asd")}} placeholder=""
            />
            <MyTextInput errorMessage="a" onSubmit={() => {console.log("asd")}} placeholder=""
            /> */}
            {/* <MyButton
                onPressFunction={()=>{}}
                text="Continue"
            /> */}
            {/* <AccountCreationMob customPageStart={0}/> */}
            {/* <MySimplePage
                title="Create Profile"
                subtitle="asdhaksdhaadsdsdadsadasdsadsasdadsaaaaaaaaaaaaaaaaaksjdhakjshdksajhdasjdhaksjdaksjhd"
                content={
                    <>
                        <StyledView className="mt-[200px]"/>
                        <MyButton
                            text="Continue"
                            onPressFunction={()=>{}}
                        />
                    </>
                    
                }
            /> */}
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