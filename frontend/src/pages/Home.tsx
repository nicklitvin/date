import { observer } from "mobx-react-lite";
import { LineChart, PieChart } from "react-native-gifted-charts";
import { globals } from "../globals";
import { Stats } from "./Stats";
import { Settings } from "./Settings";
import { MyButton } from "../components/Button";
import { Verification } from "./Verification";

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

export function Home() {
    return (
        <>
            <Verification
                currentPage={1}
            />
        </>
    )
}

export const HomeMob = observer(Home);

/*

<Stats
    stats={{
        allTime: {
            dislikedMe: 10,
            likedMe: 20,
            myDislikes: 30,
            myLikes: 40
        },
        weekly: [
            {
                dislikedMe: 10,
                likedMe: 20,
                myDislikes: 30,
                myLikes: 40
            },
            {
                dislikedMe: 40,
                likedMe: 30,
                myDislikes: 20,
                myLikes: 10
            },
            {
                dislikedMe: 30,
                likedMe: 40,
                myDislikes: 10,
                myLikes: 20
            },
            {
                dislikedMe: 20,
                likedMe: 10,
                myDislikes: 40,
                myLikes: 30
            },
        ]
    }}
/>

<Settings settings={[
    {
        title: "notification",
        value: true
    }, 
    {
        title: "notification1",
        value: false
    }, 
]}/>
*/