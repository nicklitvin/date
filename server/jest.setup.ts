import { beforeAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { MockImageHandler } from "./__testExtras__/image";
import { Handler } from "./src/handler";
import { MockPaymentHandler } from "./__testExtras__/pay";

export const usingMocks = process.argv.includes('--use-mocks=true');
export const handler = new Handler(
    new PrismaClient(), 
    usingMocks ? new MockImageHandler() : undefined,
    usingMocks ? new MockPaymentHandler() : undefined,
);

beforeAll( async () => {
    await Promise.all([
        handler.deleteEverything()
    ])
})