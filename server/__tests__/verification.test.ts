import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { addMinutes } from "date-fns";
import { makeVerificationInput } from "../__testUtils__/easySetup";
import { miscConstants } from "../src/globals";

afterEach( async () => {
    await handler.verification.deleteAllVerifications();
})

describe("verification", () => {
    const funcs = handler.verification;
    const schoolEmail = "a@berkeley.edu";
    const personalEmail = "a@gmail.com";

    it("should generate digit code", () => {
        for (let i = 0; i < 100; i++) {
            const code = funcs.generateDigitCode();
            expect(code).toBeGreaterThanOrEqual(Math.pow(
                10,miscConstants.verificationCodeLength - 1)
            )
            expect(code).toBeLessThan(Math.pow(
                10, miscConstants.verificationCodeLength)
            )
        }
    })

    it("should generate verification code", async () => {
        expect(await funcs.makeVerificationEntry(makeVerificationInput())).not.toEqual(null);
    })

    it("should not get nonverification", async () => {
        expect(await funcs.getVerificationWithCode({
            email: personalEmail,
            schoolEmail: schoolEmail,
            code: 1234
        })).toEqual(null);
    })

    it("should get verification with code", async () => {
        const input = makeVerificationInput();
        const code = await funcs.makeVerificationEntry(input);

        expect(await funcs.getVerificationWithCode({
            code: code,
            email: input.email,
            schoolEmail: input.schoolEmail
        })).not.toEqual(null);
    })

    it("should not get expired verification", async () => {
        const input = makeVerificationInput();
        const code = await funcs.makeVerificationEntry(input,addMinutes(new Date(), -1));
        
        expect(await funcs.getVerificationWithCode({
            code: code,
            email: input.email,
            schoolEmail: input.schoolEmail
        })).toEqual(null);
    })

    it("should verify school email", async () => {
        const input = makeVerificationInput();
        await funcs.makeVerificationEntry(input);
        expect(await funcs.verifyUser(input.schoolEmail)).not.toEqual(null);
    })

    it("should get verification by email/userID", async () => {
        const input = makeVerificationInput();
        await funcs.makeVerificationEntry(input);

        expect(await funcs.getVerificationByPersonalEmail(input.email)).not.toEqual(null);
        expect(await funcs.getVerificationBySchoolEmail(input.schoolEmail)).not.toEqual(null);
    })

    it("should regenerate code", async () => {
        const input = makeVerificationInput();
        const code = await funcs.makeVerificationEntry(input);
        const newCode = await funcs.regenerateVerificationCode(input.schoolEmail, code + 1);
        expect(newCode.code).not.toEqual(code);
    })

    it("should delete expired verifications", async () => {
        const input1 = makeVerificationInput("a","b");
        const input2 = makeVerificationInput("c","d");
        const input3 = makeVerificationInput("e","f");
        
        await Promise.all([
            funcs.makeVerificationEntry(input1, addMinutes(new Date(), -2)),
            funcs.makeVerificationEntry(input2, addMinutes(new Date(), 2)),
            funcs.makeVerificationEntry(input3, addMinutes(new Date(), -10)),
        ])
        expect(await funcs.removeExpiredVerifications()).toEqual(2);
    })

    it("should delete verification", async () => {
        const input = makeVerificationInput();
        await funcs.makeVerificationEntry(input);
        expect(await funcs.deleteVerification(input.schoolEmail)).not.toEqual(null);
    })

    it("should delete all verifications", async () => {
        const input1 = makeVerificationInput("a","b");
        const input2 = makeVerificationInput("c","d");
        const input3 = makeVerificationInput("e","f");
        
        await Promise.all([
            funcs.makeVerificationEntry(input1, addMinutes(new Date(), -2)),
            funcs.makeVerificationEntry(input2, addMinutes(new Date(), 2)),
            funcs.makeVerificationEntry(input3, addMinutes(new Date(), -10)),
        ])

        expect(await funcs.deleteAllVerifications()).toEqual(3);
    })

    it("should get verification count", async () => {
        const input1 = makeVerificationInput("a","b");
        const input2 = makeVerificationInput("c","d");
        const input3 = makeVerificationInput("e","f");
        
        await Promise.all([
            funcs.makeVerificationEntry(input1, addMinutes(new Date(), -2)),
            funcs.makeVerificationEntry(input2, addMinutes(new Date(), 2)),
            funcs.makeVerificationEntry(input3, addMinutes(new Date(), -10)),
        ])

        expect(await funcs.getVerificationCount()).toEqual(3);
    })
})