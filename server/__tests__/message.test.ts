import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { MessageInput } from "../src/types";
import { randomUUID } from "crypto";

afterEach( async () => {
    await handler.message.deleteAllMessages()
})

describe("message", () => {
    const funcs = handler.message;

    const makeMessageInput = (flipUsers = false) : MessageInput => {
        const userID = "userID";
        const userID_2 = "userID_2";

        return {
            userID: flipUsers ? userID_2 : userID,
            recepientID: flipUsers ? userID : userID_2,
            message: "message"
        }
    }

    const makeRandomMessageInput = () : MessageInput => {
        return {
            userID: randomUUID(),
            recepientID: randomUUID(),
            message: "message"
        }
    }
    
    it("should send message", async () => {
        expect(await funcs.sendMessage(makeMessageInput())).not.toEqual(null);
    })

    it("should not update read status if not conversation", async () => {
        const messageInput = makeMessageInput();
        await funcs.sendMessage(messageInput);
        expect(await funcs.updateReadStatus({
            userID: "random",
            fromID: messageInput.recepientID,
            timestamp: new Date()
        })).toEqual(0);
    })

    it("should not update read status for writer", async () => {
        const messageInput = makeMessageInput();
        await funcs.sendMessage(messageInput);
        expect(await funcs.updateReadStatus({
            userID: messageInput.userID,
            fromID: messageInput.recepientID,
            timestamp: new Date()
        })).toEqual(0);
    })

    it("should update read status", async () => {
        const messageInput = makeMessageInput();
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
        const message = await funcs.sendMessage(makeMessageInput());
        expect(await funcs.getMessage(message.id)).toEqual(message);
    })

    it("should not delete nonmessage", async () => {
        expect(await funcs.deleteMessage("random")).toEqual(null);
    })

    it("should delete message", async () => {
        const message = await funcs.sendMessage(makeMessageInput());
        expect(await funcs.deleteMessage(message.id)).toEqual(message);
    })

    it("should delete all messages", async () => {
        await Promise.all([
            funcs.sendMessage(makeMessageInput()),
            funcs.sendMessage(makeMessageInput()),
            funcs.sendMessage(makeRandomMessageInput())
        ])

        expect(await funcs.deleteAllMessages()).toEqual(3);
    })

    it("should get chat", async () => {
        const m1 = await funcs.sendMessage(makeMessageInput());
        const m2 = await funcs.sendMessage(makeMessageInput(true));
        const m3 = await funcs.sendMessage(makeMessageInput());
        const m4 = await funcs.sendMessage(makeRandomMessageInput())

        const chat = await funcs.getChat({
            userID: m1.userID,
            withID: m1.recepientID,
            count: 10,
            fromTime: new Date()
        })
        expect(chat.length).toEqual(3);
        expect(chat[0].timestamp.getTime()).toBeGreaterThan(chat[1].timestamp.getTime());
        expect(chat[1].timestamp.getTime()).toBeGreaterThan(chat[2].timestamp.getTime());

        const chat_2 = await funcs.getChat({
            userID: m1.userID,
            withID: m1.recepientID,
            count: 1,
            fromTime: m2.timestamp
        });
        expect(chat_2.length).toEqual(1);
        expect(chat_2[0].id).toEqual(m2.id);
    })

    it("should delete chat", async () => {
        const message = makeMessageInput();

        await Promise.all([
            funcs.sendMessage(makeMessageInput()),
            funcs.sendMessage(makeMessageInput(true)),
            funcs.sendMessage(makeMessageInput()),
            funcs.sendMessage(makeRandomMessageInput())
        ])

        expect(await funcs.deleteChat(message.userID, message.recepientID)).toEqual(3);
    })
})