import { Message, PublicProfile } from "../src/interfaces";

export const otherProfile : PublicProfile = {
    id: "otherProfileID",
    age: 21,
    attributes: [],
    description: "",
    gender: "",
    images: ["imageURL"],
    name: "Michael",
    university: "berkeley"
}

export const sentMessage : Message = {
    id: "sentID",
    message: "sentMessage",
    readStatus: true,
    recepientID: otherProfile.id,
    timestamp: new Date(),
    userID: "myUserID"
}

export const receivedMessage : Message = {
    id: "receivedID",
    message: "receivedMessage",
    readStatus: true,
    recepientID: "myUserID",
    timestamp: new Date(),
    userID: otherProfile.id
}