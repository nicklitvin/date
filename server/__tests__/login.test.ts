import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { addWeeks } from "date-fns";
import { LoginEntryInput } from "../src/interfaces";
import { miscConstants } from "../src/globals";

afterEach(async () => {
    await handler.login.deleteAllLogin();
})

describe("login", () => {
    const funcs = handler.login;
    const email = "a";

    const createInput = (email : string, date?: Date) : LoginEntryInput => ({
        email: email,
        customDate: date
    })
    

    it("should create user", async () => {
        const user = await funcs.createUser(createInput(email));

        expect(user.email).toEqual(email);
        expect(user.expire.getTime()).toBeGreaterThan(addWeeks(new Date(), miscConstants.keyExpirationWeeks - 1).getTime())
    })

    it("should get user", async () => {
        const user = await funcs.createUser(createInput(email));

        expect(await funcs.getUserByKey(user.key)).not.toEqual(null);
        expect(await funcs.getUserByEmail(user.email)).not.toEqual(null);
    })

    it("should update key", async () => {
        const before = await funcs.createUser(createInput(email));
        const after = await funcs.updateKey(email);

        expect(after.key).not.toEqual(before.key);
        expect(after.expire.getTime()).toBeGreaterThanOrEqual(before.expire.getTime());
    })

    it("should update expiration", async () => {
        const before = await funcs.createUser(createInput(email));
        const after = await funcs.updateExpiration(email);

        expect(after.key).toEqual(before.key);
        expect(after.expire.getTime()).toBeGreaterThanOrEqual(before.expire.getTime());
    })

    it("should delete all login", async () => {
        await Promise.all([
            funcs.createUser(createInput("a")),
            funcs.createUser(createInput("b")),
            funcs.createUser(createInput("c")),
        ])

        expect(await funcs.deleteAllLogin()).toEqual(3);
    })

    it("should update push token", async () => {
        const token = "a";
        const before = await funcs.createUser(createInput(email));
        expect(before.expoPushToken).toEqual(null);

        const after = await funcs.updateExpoToken(before.userID, token);
        expect(after.expoPushToken).toEqual(token);
    })
})