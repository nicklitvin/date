import { describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";

describe("mail" , () => {
    const funcs = handler.mail;

    it("should send mail", async () => {
        const email = "a";
        const code = 1234;
        await funcs.sendVerificationCode(email,code);
        await funcs.sendVerificationCode(email,code);
        await funcs.sendVerificationCode(email,code);
        expect(funcs.clearVerificationCount()).toEqual(3);
    })
})