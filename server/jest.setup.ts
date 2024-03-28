import { beforeAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { MockImageHandler } from "./__testExtras__/image";
import { Handler } from "./src/handler";
import { MockPaymentHandler } from "./__testExtras__/pay";

export const usingMocks = process.argv.includes('--use-mocks=true');
const client = new PrismaClient();
export const handler = new Handler(
    client,
    true,
    usingMocks ? new MockImageHandler() : undefined,
    usingMocks ? new MockPaymentHandler() : undefined,
);

beforeAll( async () => {
    await Promise.all([
        handler.deleteEverything()
    ])
})