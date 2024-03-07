import { Message, PublicProfile } from "../src/interfaces";

export const myUserID = "userID";

export const makePublicProfile = (id : string = "otherProfileID") : PublicProfile => ({
    id: id,
    age: 21,
    attributes: [],
    description: "",
    gender: "",
    images: ["https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"],
    name: "Michael",
})

export const makeSentMessage = (
    recepientID : string = makePublicProfile().id,
    timestamp: Date = new Date(),
) : Message => ({
    id: "sentID",
    message: "sentMessage",
    readStatus: true,
    recepientID: recepientID,
    timestamp: timestamp,
    userID: myUserID
})

export const makeReceivedMessage = (
    sentID : string = makePublicProfile().id,
    timestamp : Date = new Date(),
    read: boolean = true,
    message: string = "asdasdasdasdadadaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
) : Message => ({
    id: "receivedID",
    message: message,
    readStatus: read,
    recepientID: myUserID,
    timestamp: timestamp,
    userID: sentID
})

export const scrollToTopVal = {nativeEvent: {contentOffset: {y: 0}}};