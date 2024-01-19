import { afterEach, describe, expect, it } from "@jest/globals";
import { prismaManager, handler, createSampleUser } from "../jest.setup";

describe("login", () => {
    const userID = "1";
    const userID_2 = "2";

    it("should not see user", async () => {
        expect(await handler.doesUserExist(userID)).toEqual(false);
    })

    it("should create user", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        expect(await handler.doesUserExist(userID)).toEqual(true);
    })

    it("should create multiple users", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        expect(await handler.createUser(createSampleUser(userID_2))).toEqual(true);
        expect(await prismaManager.getUserCount()).toEqual(2);
    })

    it("should not create user again", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        expect(await handler.createUser(createSampleUser(userID))).toEqual(false);
        expect(await prismaManager.getUserCount(userID)).toEqual(1);
    })

    it("should delete notexisting user", async () => {
        expect(await handler.deleteUser(userID)).toEqual(true);
    })

    it("should delete user", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        expect(await handler.deleteUser(userID)).toEqual(true);
        expect(await handler.doesUserExist(userID)).toEqual(false);
    })

    it("should not delete other user", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        expect(await handler.createUser(createSampleUser(userID_2))).toEqual(true);
        expect(await handler.deleteUser(userID)).toEqual(true);
        expect(await prismaManager.getUserCount()).toEqual(1);
        expect(await handler.doesUserExist(userID_2)).toEqual(true);
    })
})