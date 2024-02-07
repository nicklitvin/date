import { describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";

describe("pay", () => {
    const funcs = handler.pay;

    it("should create session url", async () => {
        const userID = "userID";
        expect(await funcs.createSubscriptionSessionURL(userID, true)).
            not.toEqual(null);
    })
})
