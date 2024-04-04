import { Opinion } from "@prisma/client";
import { ImageUploadWithString, ImageUploadInput, MessageInput, NewVerificationInput, SwipeInput, UserInput, UserInputWithFiles, UserReportInput, WithEmail } from "../src/interfaces";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import mime from "mime-types";
import { handler } from "../jest.setup";
import { addYears } from "date-fns";
import { userRestrictions } from "../src/globals";

const imageFilePath = "./__testUtils__/goodImage.jpg";
const badImageFilePath = "./__testUtils__/badImage.txt";

export async function getImageDetails(good : boolean) : Promise<ImageUploadWithString> {
    return {
        content: (await fs.readFile(good ? imageFilePath : badImageFilePath)).toString("base64"),
        mimetype: mime.lookup(good ? imageFilePath : badImageFilePath) as string
    }
}

export async function getImageInput(good : boolean) : Promise<ImageUploadInput> {
    return {
        buffer: Buffer.from((await fs.readFile(good ? imageFilePath : badImageFilePath)).toString("base64")),
        mimetype: mime.lookup(good ? imageFilePath : badImageFilePath) as string
    }
}

export async function validRequestUserInput() : Promise<UserInputWithFiles & WithEmail> { 
    const upload = await getImageDetails(true);
    return {
        id: randomUUID(),
        birthday: addYears(new Date(), -userRestrictions.minAge),
        ageInterest: [18,25],
        attributes: Array.from({length: userRestrictions.maxAttributes}, (_,index) => `${index}`),
        email: "a@berkeley.edu",
        gender: "Male",
        genderInterest: ["Male", "Female"],
        files: [
            {
                content: upload.content,
                mimetype: upload.mimetype
            },
            {
                content: upload.content,
                mimetype: upload.mimetype
            },
        ],
        name: "a".repeat(userRestrictions.maxNameLength),
        description: "a".repeat(userRestrictions.maxDescriptionLength),
        smoking: "Never",
        alcohol: "Never",
    }
}

export function createUserInput(email = "a@berkeley.edu") : UserInput {
    return {
        id: randomUUID(),
        email: email,
        name: "a",
        birthday: addYears(new Date(), -21),
        ageInterest: [18,25],
        gender: "Male",
        genderInterest: ["Male"],
        attributes: ["Basketball"],
        images: ["imageURL"],
        description: "description",
        alcohol: "Never",
        smoking: "Never"
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

export async function matchUsers(userID : string, userID_2 : string) : Promise<Date> {
    const [_, swipe] = await Promise.all([
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
    return swipe!.timestamp;
}

export async function makeTwoUsersAndMatch() {
    const {user, user_2} = await makeTwoUsers();
    const timestamp = await matchUsers(user.id, user_2.id);
    return {user, user_2, timestamp};
}

export async function makeTwoUsers() {
    const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
    const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));
    return {user, user_2};
}

export async function createUsersForSwipeFeed() {
    const uInput = createUserInput("a@berkeley.edu");
    uInput.gender = "Male";
    uInput.genderInterest = ["Female"];
    uInput.ageInterest = [18,30];
    uInput.birthday = addYears(new Date(),-30);

    const uInput2 = createUserInput("b@berkeley.edu");
    uInput2.gender = "Male";
    uInput2.birthday = addYears(new Date(),-20);

    const uInput3 = createUserInput("c@berkeley.edu");
    uInput3.gender = "Female";
    uInput3.birthday = addYears(new Date(),-20);

    const uInput4 = createUserInput("d@berkeley.edu");
    uInput4.gender = "Female";
    uInput4.genderInterest = ["Male", "Female"];
    uInput4.birthday = addYears(new Date(),-21);
    uInput4.ageInterest = [18,30];

    const [user, user2, user3, user4] = await Promise.all([
        handler.user.createUser(uInput),
        handler.user.createUser(uInput2),
        handler.user.createUser(uInput3),
        handler.user.createUser(uInput4),
    ])

    await Promise.all([
        handler.user.editUser({
            setting: "elo",
            userID: user.id,
            value: 5
        }),
        handler.user.editUser({
            setting: "elo",
            userID: user2.id,
            value: 3
        }),
        handler.user.editUser({
            setting: "elo",
            userID: user3.id,
            value: 4
        }),
        handler.user.editUser({
            setting: "elo",
            userID: user4.id,
            value: 6
        })
    ])
    
    return { user, user2, user3, user4 }
}

export function makeVerificationInput(personalEmail? : string, schoolEmail? : string) 
    : NewVerificationInput & WithEmail
{
    return {
        email: personalEmail ?? "a@gmail.com",
        schoolEmail: schoolEmail ?? "a@berkeley.edu"
    }
}