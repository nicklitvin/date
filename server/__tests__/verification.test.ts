import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { globals } from "../src/globals";
import { addMinutes } from "date-fns";

afterEach( async () => {
    await handler.verification.deleteAllVerifications();
})

describe("verification", () => {
    const funcs = handler.verification;
    const email = "a@berkeley.edu";
    const userID = "userID";

    it("should generate digit code", () => {
        for (let i = 0; i < 100; i++) {
            const code = funcs.generateDigitCode();
            expect(code).toBeGreaterThanOrEqual(Math.pow(
                10,globals.verificationCodeLength - 1)
            )
            expect(code).toBeLessThan(Math.pow(
                10, globals.verificationCodeLength) - 1
            )
        }
    })

    it("should make verification entry", async () => {
        expect(await funcs.makeVerificationEntry({
            email: email,
            userID: userID
        })).not.toEqual(null);
    })

    it("should not get nonverification", async () => {
        expect(await funcs.getVerificationWithCode({
            userID: userID,
            email: email,
            code: 1234
        })).toEqual(null);
    })

    it("should get verification", async () => {
        const code = await funcs.makeVerificationEntry({
            email: email,
            userID: userID
        });

        expect(await funcs.getVerificationWithCode({
            code: code,
            email: email,
            userID: userID
        })).not.toEqual(null);
    })

    it("should not get expired verification", async () => {
        const code = await funcs.makeVerificationEntry({
            email: email,
            userID: userID
        }, addMinutes(new Date(), -1));

        
        expect(await funcs.getVerificationWithCode({
            code: code,
            email: email,
            userID: userID
        })).toEqual(null);
    })

    it("should verify email", async () => {
        await funcs.makeVerificationEntry({
            email: email,
            userID: "random"
        });
        expect(await funcs.verifyUser(email)).not.toEqual(null);
    })

    it("should get verification by email/userID", async () => {
        await funcs.makeVerificationEntry({
            email: email,
            userID: userID
        });

        expect(await funcs.getVerificationByEmail(email)).not.toEqual(null);
        expect(await funcs.getVerificationByUserID(userID)).not.toEqual(null);
    })

    it("should regenerate code", async () => {
        const code = await funcs.makeVerificationEntry({
            email: email,
            userID: userID
        });

        const newCode = await funcs.regenerateVerificationCode(email, code + 1);
        expect(newCode.code).not.toEqual(code);
    })

    it("should delete expired verifications", async () => {
        await Promise.all([
            funcs.makeVerificationEntry({email: "a", userID: "1"}, 
                addMinutes(new Date(), -2)
            ),
            funcs.makeVerificationEntry({email: "b", userID: "1"}, 
                addMinutes(new Date(), 2)
            ),
            funcs.makeVerificationEntry({email: "c", userID: "1"}, 
                addMinutes(new Date(), -10)
            ),
        ])
        expect(await funcs.removeExpiredVerifications()).toEqual(2);
    })

    it("should delete verification", async () => {
        await funcs.makeVerificationEntry({
            email: email,
            userID: userID
        });
        expect(await funcs.deleteVerification(email)).not.toEqual(null);
    })

    it("should delete all verifications", async () => {
        await Promise.all([
            funcs.makeVerificationEntry({email: "a", userID: "1"}, 
                addMinutes(new Date(), -2)
            ),
            funcs.makeVerificationEntry({email: "b", userID: "1"}, 
                addMinutes(new Date(), 2)
            ),
            funcs.makeVerificationEntry({email: "c", userID: "1"}, 
                addMinutes(new Date(), -10)
            ),
        ])

        expect(await funcs.deleteAllVerifications()).toEqual(3);
    })
})