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
    university: "berkeley"
})

export const makeSentMessage = (recepientID : string = makePublicProfile().id) : Message => ({
    id: "sentID",
    message: "sentMessage",
    readStatus: true,
    recepientID: recepientID,
    timestamp: new Date(),
    userID: myUserID
})

export const makeReceivedMessage = (sentID : string = makePublicProfile().id) : Message => ({
    id: "receivedID",
    message: "receivedMessage",
    readStatus: true,
    recepientID: myUserID,
    timestamp: new Date(),
    userID: sentID
})