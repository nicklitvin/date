import { afterEach, describe, expect, it } from "@jest/globals";
import { TestPrismaManager } from "../testModules/TestPrismaManager";
import { Handler } from "../src/Handler";
import { User } from "@prisma/client";

function createSampleUser(userID : string) : User {
    return {
        age: 20,
        description: "hi",
        email: "a@berkeley.edu",
        gender: "Male",
        genderInterest: "Male",
        id: userID,
        images: [],
        interests: [],
        name: "name" 
    }
}

describe("login", () => {
    const prismaManager = new TestPrismaManager()
    const handler = new Handler(prismaManager);
    const userID = "1";
    const userID_2 = "2";

    afterEach( async () => {
        await prismaManager.deleteEverything();
    })

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