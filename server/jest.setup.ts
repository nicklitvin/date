import { beforeAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { MockImageHandler } from "./__testExtras__/image";
import { Handler } from "./src/handler";
import { MockPaymentHandler } from "./__testExtras__/pay";
import { MockEmailHandler } from "./__testExtras__/mail";

export const usingMocks = process.argv.includes('--use-mocks=true');
export const handler = new Handler({
    prisma: new PrismaClient(),
    disableNotifications: true,
    ignoreVerificaton: true,
    imageHandler: usingMocks ? new MockImageHandler() : undefined,
    paymentHandler: usingMocks ? new MockPaymentHandler() : undefined,
    mailHandler: usingMocks ? new MockEmailHandler() : undefined,
})

beforeAll( async () => {
    await Promise.all([
        handler.deleteEverything()
    ])
})