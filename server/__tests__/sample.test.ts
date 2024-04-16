import { describe, expect, it, beforeEach } from "@jest/globals";
import { handler } from "../jest.setup";
import { sampleUsers } from "../src/sample";
import { miscConstants, sampleContent } from "../src/globals";

describe("sample", () => {
    beforeEach( async () => {
        await handler.createSample(sampleUsers);
    })

    it("should create data", async () => {
        const users = await Promise.all(sampleUsers.map( val => 
            handler.user.getPublicProfile(val.id)    
        ))
        expect(users.filter( val => val == undefined)).toHaveLength(0);

        const matches = await handler.swipe.getAllMatches(sampleContent.userID, new Date());
        expect(matches).toHaveLength(4);

        expect(sampleContent.messages.length).toBeGreaterThan(miscConstants.messagesLoadedInChat);
        const chat1 = await handler.message.getChat({
            userID: sampleContent.userID,
            fromTime: new Date(),
            withID: "oldmatch1"
        })
        expect(chat1).toHaveLength(miscConstants.messagesLoadedInChat);

        const chat2 = await handler.message.getChat({
            userID: sampleContent.userID,
            fromTime: new Date(),
            withID: "oldmatch2"
        })
        expect(chat2).toHaveLength(2);
    })

    it("should go through login process", async () => {
        expect(await handler.loginWithToken({}, sampleContent.email)).not.toEqual(null);
        
        const code = await handler.getVerificationCode({
            email: sampleContent.email,
            schoolEmail: sampleContent.eduEmail
        })

        expect(code.data).toEqual(sampleContent.code);

        const regenerate = await handler.regenerateVerificationCode(sampleContent.eduEmail);
        expect(regenerate.data).toEqual(sampleContent.code);

        expect(await handler.verifyUserWithCode({
            email: sampleContent.email,
            schoolEmail: sampleContent.eduEmail,
            code: sampleContent.code
        })).not.toEqual(null);
    })
})