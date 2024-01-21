import { describe, expect, it } from "@jest/globals";
import { createSampleUser, createTwoUsersInSameUni, defaults, handler, prismaManager } from "../jest.setup";

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
        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2, "Like")).toEqual(true);
        expect(await handler.makeSwipe(defaults.userID_2, defaults.userID, "Like")).toEqual(true);

        expect(await handler.sendMessage(
            defaults.userID, defaults.userID_2, defaults.message)
        ).toEqual(true);
        expect(await prismaManager.getMessageCount()).toEqual(1);
    })
})