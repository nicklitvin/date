import { Message, PublicProfile } from "../src/interfaces";

export const myUserID = "userID";

export const makePublicProfile = (id : string = "otherProfileID") : PublicProfile => ({
    id: id,
    age: 21,
    attributes: [],
    description: "",
    gender: "",
    images: ["imageURL"],
    name: "Michael",
})

export const makeSentMessage = (
    recepientID : string = makePublicProfile().id,
    timestamp: Date = new Date()
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
    timestamp : Date = new Date()
) : Message => ({
    id: "receivedID",
    message: "receivedMessage",
    readStatus: true,
    recepientID: myUserID,
    timestamp: timestamp,
    userID: sentID
})