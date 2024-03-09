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
import { ChatPreview, Message, NewMatch, PublicProfile } from "../interfaces";
import { Attributes } from "./Attributes";
import { ScrollView } from "react-native";
import { globals } from "../globals";
import { MyModal } from "../components/Modal";
import { Matches } from "./Matches";
import { Preferences } from "./Preferences";

// const myUserID = "userID";

// const recepientProfile : PublicProfile = {
//     name: "Michael",
//     age: 21,
//     attributes: [],
//     description: "",
//     gender: "Male",
//     id: "abc",
//     images: ["https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"],
// }
// const latestMessages : Message[] = [
//     {
//         id: "id",
//         message: "hi",
//         readStatus: true,
//         recepientID: recepientProfile.id,
//         timestamp: new Date(Date.UTC(2000, 0, 1, 8, 1)),
//         userID: myUserID
//     },
//     {
//         id: "id1",
//         message: "hey",
//         readStatus: true,
//         recepientID: myUserID,
//         timestamp: new Date(Date.UTC(2000, 0, 1, 8, 0)),
//         userID: recepientProfile.id
//     },
// ]


export function Home() {
    // const [x, setX] = useState<boolean>(false);
    // const messages : Message[] = Array.from({length: 20}).map( (val,index) => ({
    //     id: String(20-index),
    //     message: index % 3 == 0 ? `${20-index}` : `${20-index}`,
    //     readStatus: true,
    //     recepientID: index % 2 == 0 ? recepientProfile.id : "me",
    //     timestamp: new Date(2000,0,1,0,20-index),
    //     userID: index % 2 != 0 ? recepientProfile.id : "me"
    // }))
    // const latestMessages : Message[] = [
    //     {
    //         id: "id",
    //         message: "hi",
    //         readStatus: true,
    //         recepientID: recepientProfile.id,
    //         timestamp: new Date(Date.UTC(2000, 0, 1, 8, 1)),
    //         userID: myUserID
    //     },
    //     {
    //         id: "id1",
    //         message: "hey",
    //         readStatus: true,
    //         recepientID: myUserID,
    //         timestamp: new Date(Date.UTC(2000, 0, 1, 8, 0)),
    //         userID: recepientProfile.id
    //     },
    //     {
    //         id: "id2",
    //         message: "sooo",
    //         readStatus: false,
    //         recepientID: recepientProfile.id,
    //         timestamp: new Date(Date.UTC(2000, 0, 1, 6, 0)),
    //         userID: myUserID
    //     } 
    // ]

    // const latestMessages1 : Message[] = Array.from({length: 20}).map( (val,index) => ({
    //     id: String(index),
    //     message: "aksjdasd",
    //     readStatus: true,
    //     recepientID: recepientProfile.id,
    //     timestamp: new Date(index),
    //     userID: "id"
    // }))

    // const profiles = [
    //     makePublicProfile("id1"),
    //     makePublicProfile("id2"),
    //     makePublicProfile("id3"),
    //     makePublicProfile("id4"),
    //     makePublicProfile("id5"),
    //     makePublicProfile("id6"),
    // ];

    // const messages1 : Message[] = [makeSentMessage(profiles[0].id, new Date(4))];
    // const messages2 : Message[] = [
    //     makeSentMessage(profiles[1].id, new Date(3)),
    //     makeSentMessage(profiles[1].id, new Date(2)),
    // ];
    // const messages3 : Message[] = [makeSentMessage(profiles[2].id, new Date(1))];

    // const chatPreview1 : ChatPreview = {
    //     messages: messages1,
    //     profile: profiles[0]
    // }
    // const chatPreview2 : ChatPreview = {
    //     messages: messages2,
    //     profile: profiles[1]
    // }
    // const chatPreview3 : ChatPreview = {
    //     messages: messages3,
    //     profile: profiles[2]
    // }
    // const chatPreview4 : ChatPreview = {
    //     messages: messages1,
    //     profile: profiles[3]
    // }
    // const chatPreview5 : ChatPreview = {
    //     messages: messages1,
    //     profile: profiles[4]
    // }
    // let chatPreviews = [chatPreview1, chatPreview2, chatPreview3, chatPreview4, chatPreview5];
    // let newMatches : NewMatch[] = [
    //     {
    //         profile: profiles[0],
    //         timestamp: new Date()
    //     },
    //     {
    //         profile: profiles[1],
    //         timestamp: new Date()
    //     },
    //     {
    //         profile: profiles[2],
    //         timestamp: new Date()
    //     },
    //     {
    //         profile: profiles[3],
    //         timestamp: new Date()
    //     },
    //     {
    //         profile: profiles[4],
    //         timestamp: new Date()
    //     },
    //     {
    //         profile: profiles[5],
    //         timestamp: new Date()
    //     }
    // ];

    return (
        <>
            <Preferences
                agePreference={[18,21]}
                genderPreference={["Male"]}
            />
            {/* <Matches
                chatPreviews={[]}
                newMatches={[]}
            />
            <Chat
                latestMessages={[]}
                publicProfile={recepientProfile}
            /> */}
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