import { beforeAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { MockImageHandler } from "./__testExtras__/image";
import { Handler } from "./src/handler";

export const handler = new Handler(
    new PrismaClient(), 
    process.argv.includes('--use-mocks=true') ? new MockImageHandler() : undefined
);

beforeAll( async () => {
    await Promise.all([
        handler.deleteEverything()
    ])
})
