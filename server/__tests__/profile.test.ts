import { describe, expect, it } from "@jest/globals";
import { createSampleUser, defaults, handler } from "../jest.setup";
import { User } from "@prisma/client";

describe("profile", () => {
    const validAttribute : (keyof User) = "age";
    const validAttributeValue = 12;
    const invalidAttributeValue = "12";

    it("should not get nonuser", async () => {
        expect(await handler.getProfile(defaults.userID)).toEqual(null);
    })    

    it("should get user", async () => {
        const initial = createSampleUser(defaults.userID);
        expect(await handler.createUser(initial)).toEqual(true);
        expect(await handler.getProfile(defaults.userID)).toEqual(initial);
    })

    it("should not edit nonuser", async () => {
        expect(await handler.editUser(defaults.userID, validAttribute, validAttributeValue)).toEqual(false);
    })

    it("should not edit user with bad setting", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.editUser(defaults.userID, validAttribute, validAttribute)).toEqual(false);
    })

    it("should not edit user with bad value", async () => {
        const initial = createSampleUser(defaults.userID);
        expect(await handler.createUser(initial)).toEqual(true);
        expect(await handler.editUser(defaults.userID, validAttribute, invalidAttributeValue)).toEqual(false);
        
        const changedUser = await handler.getProfile(defaults.userID);
        expect(changedUser?.age).toEqual(initial.age);
    })

    it("should edit user with good input", async () => {
        const initial = createSampleUser(defaults.userID);
        expect(await handler.createUser(initial)).toEqual(true);
        expect(await handler.editUser(defaults.userID, validAttribute, validAttributeValue)).toEqual(true);
        
        const changedUser = await handler.getProfile(defaults.userID);
        expect(changedUser?.age == initial.age).toEqual(false);
    })

    it("should not get public profile of nonuser", async () => {
        expect(await handler.getPublicProfile(defaults.userID)).toEqual(null);       
    })

    it("should get public profile of user", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(Boolean(await handler.getPublicProfile(defaults.userID))).toEqual(true);       
    })
})