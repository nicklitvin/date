import { describe, expect, it } from "@jest/globals";
import { prismaManager, handler, createSampleUser, defaults } from "../jest.setup";

describe("login", () => {
    const badEmail = "a@gmail.com";
    const badEmail_2 = "a.edu@gmail.com";
    const mismatchEmail = "a@berkeley.edu";
    const mismatchUni = "stanford";

    it("should not see nonuser", async () => {
        expect(await handler.doesUserExist(defaults.userID)).toEqual(false);
    })

    it("should not create bad email user", async () => {
        const user = createSampleUser(defaults.userID);
        user.email = badEmail;

        expect(await handler.createUser(user)).toEqual(false);
    })

    it("should not create bad email user 2", async () => {
        const user = createSampleUser(defaults.userID);
        user.email = badEmail_2;

        expect(await handler.createUser(user)).toEqual(false);
    })

    it("should not create not matching university user", async () => {
        const user = createSampleUser(defaults.userID);
        user.email = mismatchEmail;
        user.university = mismatchUni;

        expect(await handler.createUser(user)).toEqual(false);
    })

    it("should create user", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.doesUserExist(defaults.userID)).toEqual(true);
    })

    it("should create multiple users", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.createUser(createSampleUser(defaults.userID_2))).toEqual(true);
        expect(await prismaManager.getUserCount()).toEqual(2);
    })

    it("should not create user again", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(false);
        expect(await prismaManager.getUserCount(defaults.userID)).toEqual(1);
    })

    it("should delete nonuser", async () => {
        expect(await handler.deleteUser(defaults.userID)).toEqual(true);
        expect(await handler.doesUserExist(defaults.userID)).toEqual(false);
    })

    it("should delete user", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.deleteUser(defaults.userID)).toEqual(true);
        expect(await handler.doesUserExist(defaults.userID)).toEqual(false);
    })

    it("should not delete other user", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.createUser(createSampleUser(defaults.userID_2))).toEqual(true);
        expect(await handler.deleteUser(defaults.userID)).toEqual(true);
        expect(await prismaManager.getUserCount()).toEqual(1);
        expect(await handler.doesUserExist(defaults.userID)).toEqual(false);
    })
})