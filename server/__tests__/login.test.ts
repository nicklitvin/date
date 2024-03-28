import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { addWeeks } from "date-fns";
import { globals } from "../src/globals";

afterEach(async () => {
    await handler.login.deleteAllLogin();
})

describe("login", () => {
    const funcs = handler.login;
    const email = "a";

    it("should create user", async () => {
        const user = await funcs.createUser(email);

        expect(user.email).toEqual(email);
        expect(user.expire.getTime()).toBeGreaterThan(addWeeks(new Date(), globals.keyExpirationWeeks - 1).getTime())
    })

    it("should get user", async () => {
        const user = await funcs.createUser(email);

        expect(await funcs.getUserByKey(user.key)).not.toEqual(null);
        expect(await funcs.getUserByEmail(user.email)).not.toEqual(null);
    })

    it("should update key", async () => {
        const before = await funcs.createUser(email);
        const after = await funcs.updateKey(email);

        expect(after.key).not.toEqual(before.key);
        expect(after.expire.getTime()).toBeGreaterThanOrEqual(before.expire.getTime());
    })

    it("should update expiration", async () => {
        const before = await funcs.createUser(email);
        const after = await funcs.updateExpiration(email);

        expect(after.key).toEqual(before.key);
        expect(after.expire.getTime()).toBeGreaterThanOrEqual(before.expire.getTime());
    })

    it("should delete all login", async () => {
        await Promise.all([
            funcs.createUser("a"),
            funcs.createUser("b"),
            funcs.createUser("c"),
        ])

        expect(await funcs.deleteAllLogin()).toEqual(3);
    })

    it("should delete expired entries", async () => {
        await Promise.all([
            funcs.createUser("a", addWeeks(new Date(),-10)),
            funcs.createUser("b"),
            funcs.createUser("c"),
        ])

        expect(await funcs.deleteExpiredEntries()).toEqual(1);
    })
})