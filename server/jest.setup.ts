import { PrismaClient } from "@prisma/client";
import { Handler } from "./src/handler";
import { afterEach, beforeAll } from "@jest/globals";

const prismaClient = new PrismaClient();
export const handler = new Handler(prismaClient);

beforeAll( async () => {
    await Promise.all([
        handler.deleteEverything()
    ])
})

export async function waitOneMoment() {
    return new Promise( (res) => {
        setTimeout( () => {
            res(null)
        }, 1)
    })
}