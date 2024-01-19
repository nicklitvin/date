import { afterAll, afterEach, beforeAll } from "@jest/globals";
import { TestPrismaManager } from "./testModules/TestPrismaManager";
import { Handler } from "./src/Handler";
import { User } from "@prisma/client";

export const prismaManager = new TestPrismaManager();
export const handler = new Handler(prismaManager);

beforeAll( async () => {
    await prismaManager.deleteEverything();
})

afterEach( async () => {
    await prismaManager.deleteEverything();
})

export function createSampleUser(userID : string) : User {
    return {
        age: 20,
        description: "hi",
        email: "a@berkeley.edu",
        gender: "Male",
        attributes: [],
        interest: "Male",
        id: userID,
        images: [],
        name: "name",
        notifications: true,
        university: "berkeley"
    }
}