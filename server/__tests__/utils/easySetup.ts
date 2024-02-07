import { Opinion } from "@prisma/client";
import { globals } from "../../src/globals";
import { ImageInput, MessageInput, RequestUserInput, SwipeInput, UserInput, UserReportInput } from "../../src/interfaces";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import mime from "mime-types";
import { handler } from "../../jest.setup";

const imageFilePath = "./__tests__/utils/goodImage.jpg";
const badImageFilePath = "./__tests__/utils/badImage.txt";

export async function getImageDetails(good : boolean) : Promise<ImageInput> {
    return {
        buffer: await fs.readFile(good ? imageFilePath : badImageFilePath),
        mimetype: mime.lookup(good ? imageFilePath : badImageFilePath) as string
    }
}

export async function validRequestUserInput() : Promise<RequestUserInput> { 
    const upload = await getImageDetails(true);
    return {
        age: globals.minAge,
        attributes: Array.from({length: globals.maxAttributes}, (_,index) => `${index}`),
        interestedIn: ["Male", "Female"],
        email: "a@berkeley.edu",
        gender: "Male",
        files: [
            {
                buffer: upload.buffer,
                mimetype: upload.mimetype
            },
            {
                buffer: upload.buffer,
                mimetype: upload.mimetype
            },
        ],
        name: "a".repeat(globals.maxNameLength),
        description: "a".repeat(globals.maxDescriptionLength)
    }
}

export function createUserInput(email = "a@berkeley.edu") : UserInput {
    return {
        email: email,
        name: "a",
        age: 21,
        gender: "Male",
        interestedIn: ["Male"],
        attributes: ["Basketball"],
        images: ["imageURL"],
        description: "description"
    }
}

export function createSwipeInput(
    action : Opinion,
    userID: string = randomUUID(), 
    swipedUserID: string = randomUUID()
    ) : SwipeInput
{
    return {
        userID: userID,
        swipedUserID: swipedUserID,
        action: action
    }
}

export function createReportInput(randomID = false) : UserReportInput {
    return {
        userID: randomID ? randomUUID() : "userID",
        reportedEmail: "email"
    }
}

export function makeMessageInput(userID : string, userID_2 : string) : 
    MessageInput 
{
    return {
        userID: userID,
        recepientID: userID_2,
        message: "message"
    }
}

export function makeMessageInputWithRandoms() : MessageInput {
    return {
        userID: randomUUID(),
        recepientID: randomUUID(),
        message: "message"
    }
}

export function makeMessageInputWithOneRandom(userID : string, flipUsers = false) : 
    MessageInput 
{
    return {
        userID: flipUsers ? randomUUID() : userID,
        recepientID: flipUsers ? userID : randomUUID(),
        message: "message",
    }
}

export async function matchUsers(userID : string, userID_2 : string) {
    await Promise.all([
        handler.makeSwipe({
            userID: userID,
            swipedUserID: userID_2,
            action: "Like"
        }),
        handler.makeSwipe({
            userID: userID_2,
            swipedUserID: userID,
            action: "Like"
        })
    ])
}

export async function makeTwoUsersAndMatch() {
    const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
    const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));
    await matchUsers(user.id, user_2.id);
    return {user, user_2};
}