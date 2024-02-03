import { afterEach, describe, expect, it } from "@jest/globals";
import { handler, waitOneMoment } from "../jest.setup";
import { MessageInput } from "../src/interfaces";
import { randomUUID } from "crypto";

afterEach( async () => {
    await handler.message.deleteAllMessages()
})

export const makeMessageInput = (userID : string, userID_2 : string) : 
    MessageInput => 
{
    return {
        userID: userID,
        recepientID: userID_2,
        message: "message"
    }
}

export const makeMessageInputWithRandoms = () : MessageInput => {
    return {
        userID: randomUUID(),
        recepientID: randomUUID(),
        message: "message"
    }
}

export const makeMessageInputWithOneRandom = (userID : string, flipUsers = false) : 
    MessageInput => 
{
    return {
        userID: flipUsers ? randomUUID() : userID,
        recepientID: flipUsers ? userID : randomUUID(),
        message: "message",
    }
}

describe("message", () => {
    const funcs = handler.message;
    const userID = "userID";
    const userID_2 = "userID_2";
    
    it("should send message", async () => {
        expect(await funcs.sendMessage(makeMessageInput(userID,userID_2))).
            not.toEqual(null);
    })

    it("should not update read status if not conversation", async () => {
        const messageInput = makeMessageInput(userID, userID_2);
        await funcs.sendMessage(messageInput);
        expect(await funcs.updateReadStatus({
            userID: "random",
            fromID: messageInput.recepientID,
            timestamp: new Date()
        })).toEqual(0);
    })

    it("should not update read status for writer", async () => {
        const messageInput = makeMessageInput(userID, userID_2);
        await funcs.sendMessage(messageInput);
        expect(await funcs.updateReadStatus({
            userID: messageInput.userID,
            fromID: messageInput.recepientID,
            timestamp: new Date()
        })).toEqual(0);
    })

    it("should update read status", async () => {
        const messageInput = makeMessageInput(userID, userID_2);
        await funcs.sendMessage(messageInput);
        expect(await funcs.updateReadStatus({
            userID: messageInput.recepientID,
            fromID: messageInput.userID,
            timestamp: new Date()
        })).toEqual(1);
    })

    it("should not get nonmessage", async () => {
        expect(await funcs.getMessage("random")).toEqual(null);
    })

    it("should get message", async () => {
        const message = await funcs.sendMessage(makeMessageInput(userID, userID_2));
        expect(await funcs.getMessage(message.id)).toEqual(message);
    })

    it("should not delete nonmessage", async () => {
        expect(await funcs.deleteMessage("random")).toEqual(null);
    })

    it("should delete message", async () => {
        const message = await funcs.sendMessage(makeMessageInput(userID, userID_2));
        expect(await funcs.deleteMessage(message.id)).toEqual(message);
    })

    it("should delete all messages", async () => {
        await Promise.all([
            funcs.sendMessage(makeMessageInput(userID, userID_2)),
            funcs.sendMessage(makeMessageInput(userID, userID_2)),
            funcs.sendMessage(makeMessageInputWithRandoms())
        ])

        expect(await funcs.deleteAllMessages()).toEqual(3);
    })

    it("should get chat", async () => {
        await funcs.sendMessage(makeMessageInput(userID, userID_2));
        await waitOneMoment();
        const m2 = await funcs.sendMessage(makeMessageInput(userID_2, userID));
        await waitOneMoment();
        await funcs.sendMessage(makeMessageInput(userID, userID_2));
        await waitOneMoment();
        await funcs.sendMessage(makeMessageInputWithRandoms())

        const chat = await funcs.getChat({
            userID: userID,
            withID: userID_2,
            count: 10,
            fromTime: new Date()
        })
        expect(chat.length).toEqual(3);
        expect(chat[0].timestamp.getTime()).toBeGreaterThan(chat[1].timestamp.getTime());
        expect(chat[1].timestamp.getTime()).toBeGreaterThan(chat[2].timestamp.getTime());

        const chat_2 = await funcs.getChat({
            userID: userID,
            withID: userID_2,
            count: 1,
            fromTime: m2.timestamp
        });
        expect(chat_2.length).toEqual(1);
        expect(chat_2[0].id).toEqual(m2.id);
    })

    it("should delete chat", async () => {
        await Promise.all([
            funcs.sendMessage(makeMessageInput(userID, userID_2)),
            funcs.sendMessage(makeMessageInput(userID_2, userID)),
            funcs.sendMessage(makeMessageInput(userID, userID_2)), 
            funcs.sendMessage(makeMessageInputWithRandoms())
        ])

        expect(await funcs.deleteChat(userID, userID_2)).toEqual(3);
    })

    it("should delete all chats with user", async () => {
        await Promise.all([
            funcs.sendMessage(makeMessageInputWithOneRandom(userID)),
            funcs.sendMessage(makeMessageInputWithOneRandom(userID)),
            funcs.sendMessage(makeMessageInputWithOneRandom(userID, true)),
            funcs.sendMessage(makeMessageInputWithRandoms())
        ])

        expect(await funcs.deleteAllChatsWithUser(userID)).toEqual(3);
    })
})