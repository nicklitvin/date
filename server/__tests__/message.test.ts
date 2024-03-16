import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { MessageInput } from "../src/interfaces";
import { randomUUID } from "crypto";
import { makeMessageInput, makeMessageInputWithOneRandom, makeMessageInputWithRandoms } from "../__testUtils__/easySetup";

afterEach( async () => {
    await handler.message.deleteAllMessages()
})

describe("message suite", () => {
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
        await funcs.sendMessage(makeMessageInput(userID, userID_2), new Date(1));
        const m2 = await funcs.sendMessage(makeMessageInput(userID_2, userID), new Date(2));
        await funcs.sendMessage(makeMessageInput(userID, userID_2), new Date(3));
        await funcs.sendMessage(makeMessageInputWithRandoms(), new Date(4));

        const chat = await funcs.getChat({
            userID: userID,
            withID: userID_2,
            fromTime: new Date()
        })
        expect(chat.length).toEqual(3);
        expect(chat[0].timestamp.getTime()).toBeGreaterThan(chat[1].timestamp.getTime());
        expect(chat[1].timestamp.getTime()).toBeGreaterThan(chat[2].timestamp.getTime());
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

    it("should get messages from distinct users", async () => {
        const [m1,m2,m3,m4] = await Promise.all([
            funcs.sendMessage(makeMessageInputWithOneRandom(userID), new Date(10)),
            funcs.sendMessage(makeMessageInputWithOneRandom(userID), new Date(11)),
            funcs.sendMessage(makeMessageInputWithOneRandom(userID, true), new Date(12)),
            funcs.sendMessage(makeMessageInputWithRandoms(), new Date(13))
        ])

        const data = await funcs.getLatestMessageFromDistinctUsers({
            userID: userID,
            timestamp: new Date()
        })
        expect(data.messagesFromUserID.length).toEqual(2);
        expect(data.messagesFromUserID[0].id).toEqual(m2.id);
        expect(data.messagesFromUserID[1].id).toEqual(m1.id);

        expect(data.messagesToUserID.length).toEqual(1);
        expect(data.messagesToUserID[0].id).toEqual(m3.id);
        
        const data_2 = await funcs.getLatestMessageFromDistinctUsers({
            userID: userID,
            timestamp: new Date(5)
        })
        expect(data_2.messagesFromUserID.length).toEqual(0);
        expect(data_2.messagesToUserID.length).toEqual(0);
    })
})