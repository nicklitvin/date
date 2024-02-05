import { beforeAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { MockImageHandler } from "./__testExtras__/image";
import { Handler } from "./src/handler";

export const isAWSMocked = process.argv.includes('--use-mocks=true');
export const handler = new Handler(
    new PrismaClient(), 
    isAWSMocked ? new MockImageHandler() : undefined
);

beforeAll( async () => {
    await Promise.all([
        handler.deleteEverything()
    ])
})
