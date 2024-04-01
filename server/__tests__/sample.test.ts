import { afterEach, describe, expect, it, beforeEach } from "@jest/globals";
import { handler } from "../jest.setup";
import { globals } from "../src/globals";
import { sampleUsers } from "../src/sample";

describe("sample", () => {
    beforeEach( async () => {
        await handler.createSample();
    })

    it("should create data", async () => {
        const users = await Promise.all(sampleUsers.map( val => 
            handler.user.getPublicProfile(val.id)    
        ))
        expect(users.filter( val => val == undefined)).toHaveLength(0);

        const matches = await handler.swipe.getAllMatches(globals.sampleUserID, new Date());
        expect(matches).toHaveLength(4);

        expect(globals.sampleMessages.length).toBeGreaterThan(globals.messagesLoadedInChat);
        const chat1 = await handler.message.getChat({
            userID: globals.sampleUserID,
            fromTime: new Date(),
            withID: "oldmatch1"
        })
        expect(chat1).toHaveLength(globals.messagesLoadedInChat);

        const chat2 = await handler.message.getChat({
            userID: globals.sampleUserID,
            fromTime: new Date(),
            withID: "oldmatch2"
        })
        expect(chat2).toHaveLength(2);
    })

    it("should go through login process", async () => {
        expect(await handler.loginWithToken({}, globals.sampleEmail)).not.toEqual(null);
        
        const code = await handler.getVerificationCode({
            email: globals.sampleEmail,
            schoolEmail: globals.sampleSchoolEmail
        })

        expect(code).toEqual(globals.sampleVerificationCode);

        expect(
            await handler.regenerateVerificationCode(globals.sampleSchoolEmail)
        ).toEqual(globals.sampleVerificationCode)

        expect(await handler.verifyUserWithCode({
            email: globals.sampleEmail,
            schoolEmail: globals.sampleSchoolEmail,
            code: globals.sampleVerificationCode
        })).not.toEqual(null);
    })
})