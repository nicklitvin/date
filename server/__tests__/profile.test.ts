import { describe, expect, it } from "@jest/globals";
import { createSampleUser, handler } from "../jest.setup";
import { User } from "@prisma/client";

describe("profile", () => {
    const userID = "1";
    const attribute : (keyof User) = "age";
    const badValue = "12";
    const goodValue = 12;

    it("should not get nonuser", async () => {
        expect(await handler.getProfile(userID)).toEqual(null);
    })    

    it("should get user", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        expect(await handler.getProfile(userID)).toEqual(createSampleUser(userID));
    })

    it("should not edit nonuser", async () => {
        expect(await handler.editUser(userID, attribute, goodValue)).toEqual(false);
    })

    it("should not edit user with bad setting", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        expect(await handler.editUser(userID, attribute, badValue)).toEqual(false);
    })

    it("should not edit user with bad value", async () => {
        const initialUser = createSampleUser(userID);
        expect(await handler.createUser(initialUser)).toEqual(true);
        expect(await handler.editUser(userID, attribute, badValue)).toEqual(false);
        
        const changedUser = await handler.getProfile(userID);
        expect(changedUser?.age).toEqual(initialUser.age);
    })

    it("should edit user with good input", async () => {
        const initial = createSampleUser(userID);
        expect(await handler.createUser(initial)).toEqual(true);
        expect(await handler.editUser(userID, attribute, goodValue)).toEqual(true);
        
        const changedUser = await handler.getProfile(userID);
        expect(changedUser?.age == initial.age).toEqual(false);
    })
})