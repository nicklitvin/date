import { describe, expect, it } from "@jest/globals";
import { createSampleChatLog, createSampleUser, createTwoUsersInSameUni, defaults, handler, matchUsers, prismaManager } from "../jest.setup";

describe("message", () => {
    it("should not send message if not like each other 1", async () => {
        await createTwoUsersInSameUni();
        expect(await handler.sendMessage(
            defaults.userID, defaults.userID_2, defaults.message)
        ).toEqual(false);
        expect(await prismaManager.getMessageCount()).toEqual(0);
    })

    it("should not send message if not like each other 2", async () => {
        await createTwoUsersInSameUni();
        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2, "Like")).toEqual(true);

        expect(await handler.sendMessage(
            defaults.userID, defaults.userID_2, defaults.message)
        ).toEqual(false);
        expect(await prismaManager.getMessageCount()).toEqual(0);
    })

    it("should not send message if not like each other 3", async () => {
        await createTwoUsersInSameUni();
        expect(await handler.makeSwipe(defaults.userID_2, defaults.userID, "Like")).toEqual(true);

        expect(await handler.sendMessage(
            defaults.userID, defaults.userID_2, defaults.message)
        ).toEqual(false);
        expect(await prismaManager.getMessageCount()).toEqual(0);
    })

    it("should not send message if not like each other 4", async () => {
        await createTwoUsersInSameUni();
        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2, "Like")).toEqual(true);
        expect(await handler.makeSwipe(defaults.userID_2, defaults.userID, "Dislike")).toEqual(true);

        expect(await handler.sendMessage(
            defaults.userID, defaults.userID_2, defaults.message)
        ).toEqual(false);
        expect(await prismaManager.getMessageCount()).toEqual(0);
    })

    it("should not send message if not like each other 5", async () => {
        await createTwoUsersInSameUni();
        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2, "Dislike")).toEqual(true);
        expect(await handler.makeSwipe(defaults.userID_2, defaults.userID, "Like")).toEqual(true);

        expect(await handler.sendMessage(
            defaults.userID, defaults.userID_2, defaults.message)
        ).toEqual(false);
        expect(await prismaManager.getMessageCount()).toEqual(0);
    })

    it("should send message if users like each other", async () => {
        await createTwoUsersInSameUni();
        await matchUsers(defaults.userID, defaults.userID_2);

        expect(await handler.sendMessage(
            defaults.userID, defaults.userID_2, defaults.message)
        ).toEqual(true);
        expect(await prismaManager.getMessageCount()).toEqual(1);
    })

    it("should not update if no messages", async () => {
        await createTwoUsersInSameUni();
        expect(await handler.updateUserReadStatus(defaults.userID, defaults.userID_2)).toEqual(0);
    })

    it("should not update read status of 2 chats", async () => {
        await createTwoUsersInSameUni();

        const user3 = createSampleUser(defaults.userID_3);
        user3.email = defaults.calEmail_3;
        user3.university = defaults.calName;
        expect(await handler.createUser(user3)).toEqual(true);

        await matchUsers(defaults.userID, defaults.userID_2);
        await matchUsers(defaults.userID, defaults.userID_3);

        expect(await handler.sendMessage(defaults.userID_2, defaults.userID, defaults.message)).toEqual(true);
        expect(await handler.sendMessage(defaults.userID_3, defaults.userID, defaults.message_2)).toEqual(true);

        expect(await handler.updateUserReadStatus(defaults.userID, defaults.userID_2)).toEqual(1);

        const log_2 = await prismaManager.getChatLog(defaults.userID, defaults.userID_2);
        expect(log_2[0].readStatus).toEqual(true);

        const log_3 = await prismaManager.getChatLog(defaults.userID, defaults.userID_3);
        expect(log_3[0].readStatus).toEqual(false);
    })

    it("should update all unread chats at once", async () => {
        await createTwoUsersInSameUni();
        await matchUsers(defaults.userID, defaults.userID_2);

        expect(await handler.sendMessage(defaults.userID, defaults.userID_2, defaults.message)).toEqual(true);
        expect(await handler.sendMessage(defaults.userID, defaults.userID_2, defaults.message_2)).toEqual(true);

        const before = await prismaManager.getChatLog(defaults.userID, defaults.userID_2);
        expect(before.filter( (message) => message.readStatus == true).length).toEqual(0);

        expect(await handler.updateUserReadStatus(defaults.userID_2, defaults.userID)).toEqual(2);

        const after = await prismaManager.getChatLog(defaults.userID, defaults.userID_2);
        expect(after.filter( (message) => message.readStatus == true).length).toEqual(2);
    })

    it("should return chat log", async () => {
        await createTwoUsersInSameUni();
        await matchUsers(defaults.userID, defaults.userID_2);
        const messages = await createSampleChatLog(defaults.userID, defaults.userID_2, 1, 5);
        expect(messages.length).toEqual(5);

        const msg_1 = await handler.getMessages(defaults.userID, defaults.userID_2, 1, new Date(25));
        expect(msg_1.length).toEqual(1);
        expect(msg_1[0].timestamp.getTime()).toEqual(new Date(20).getTime());

        const msg_2 = await handler.getMessages(defaults.userID, defaults.userID_2, 1, new Date(5));
        expect(msg_2.length).toEqual(0);

        const msg_3 = await handler.getMessages(defaults.userID, defaults.userID_2, 10, new Date(35));
        expect(msg_3.length).toEqual(3);
        expect(msg_3[0].timestamp.getTime()).toEqual(new Date(30).getTime());
        expect(msg_3[1].timestamp.getTime()).toEqual(new Date(20).getTime());
        expect(msg_3[2].timestamp.getTime()).toEqual(new Date(10).getTime());
    })
})