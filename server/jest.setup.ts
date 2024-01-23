import { afterAll, afterEach, beforeAll, expect } from "@jest/globals";
import { TestPrismaManager } from "./testModules/TestPrismaManager";
import { Handler } from "./src/Handler";
import { Message, User } from "@prisma/client";

export const prismaManager = new TestPrismaManager();
export const handler = new Handler(prismaManager);

beforeAll( async () => {
    await prismaManager.deleteEverything();
})

afterEach( async () => {
    await prismaManager.deleteEverything();
})

export function createSampleUser(userID : string) : User {
    return {
        age: 20,
        description: "hi",
        email: "a@berkeley.edu",
        gender: "Male",
        attributes: [],
        interest: "Male",
        id: userID,
        images: [],
        name: "name",
        notifications: true,
        university: "berkeley"
    }
}

export const defaults = {
    badID : "bad",
    userID : "1",
    userID_2 : "2",
    userID_3 : "3",
    calEmail : "a@berkeley.edu",
    calEmail_2 : "b@berkeley.edu",
    calEmail_3 : "c@berkeley.edu",
    calName : "berkeley",
    stanfordEmail : "a@stanford.edu",
    stanfordName : "stanford",
    message: "message",
    message_2: "message2"
}

export async function createTwoUsersInSameUni() {
    const user1 = createSampleUser(defaults.userID);
    user1.email = defaults.calEmail;
    user1.university = defaults.calName;

    const user2 = createSampleUser(defaults.userID_2);
    user2.email = defaults.calEmail_2;
    user2.university = defaults.calName;

    expect(await handler.createUser(user1)).toEqual(true);
    expect(await handler.createUser(user2)).toEqual(true);

    return {
        user1: user1,
        user2: user2
    }
}

export async function matchUsers(userID : string, otherID : string) {
    expect(await handler.makeSwipe(userID,otherID,"Like")).toEqual(true);
    expect(await handler.makeSwipe(otherID,userID,"Like")).toEqual(true);
}

export async function createSampleChatLog(userID : string, otherID : string, start: number, count : number) {
    const messages : Message[] = [];
    for (let i = 0; i < count; i++) {
        const message = await prismaManager.createChatAtTime(userID, otherID, new Date(start + 10*i), String(i) );
        messages.push(message);
    }
    expect(messages.length).toEqual(count);    
    return messages;
}