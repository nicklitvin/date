import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";

afterEach(async () => {
    await handler.freeTrial.deleteAllFreeTrialUsedUsers();
})

describe("freeTrial", () => {
    const funcs = handler.freeTrial;
    it("should add email", async () => {
        expect(await funcs.addUser("email")).not.toEqual(null);
    })

    it("should get if email exists", async () => {
        const email = "email";
        expect(await funcs.hasEmailUsedFreeTrial(email)).toEqual(false);
        const user = await funcs.addUser(email);
        expect(await funcs.hasEmailUsedFreeTrial(email)).toEqual(true);
    })

    it("should delete all users", async () => {
        await Promise.all([
            funcs.addUser("email"),
            funcs.addUser("email2"),
            funcs.addUser("email3"),
            funcs.addUser("email4"),
        ]);

        expect(await funcs.deleteAllFreeTrialUsedUsers()).toEqual(4);
    })
})