import { describe, expect, it } from "@jest/globals";
import { createSampleUser, defaults, handler } from "../jest.setup";
import { User } from "@prisma/client";

describe("pay", () => {
    const getMonthDiff = (date1 : Date, date2 : Date) => {
        return (date2.getFullYear() - date1.getFullYear()) * 12 +
            (date2.getMonth() - date1.getMonth());
    }    

    it("should not be subscribed by default", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        const user = await handler.getProfile(defaults.userID) as User;
        expect(user.isSubscribed).toEqual(false);
        expect(user.subscriptionID).toEqual(null);
        expect(user.subscribeEnd.getTime() < new Date().getTime()).toEqual(true);
    })

    it("should create session url", async () => {
        const session = await handler.createSubscriptioncSessionURL(defaults.userID);
        expect(session.metadata?.userID).toEqual(defaults.userID);
        expect(Boolean(session.url)).toEqual(true);
    })

    it("should not process nonuser", async () => {
        expect(await handler.processSubscriptionPayment(defaults.userID, defaults.subscriptionID)).toEqual(false);
    })

    it("should process user", async () => {
        const initial = createSampleUser(defaults.userID);
        expect(await handler.createUser(initial)).toEqual(true);
        expect(await handler.processSubscriptionPayment(defaults.userID, defaults.subscriptionID)).toEqual(true);

        const user = await handler.getProfile(defaults.userID) as User;
        expect(getMonthDiff(initial.subscribeEnd, user.subscribeEnd)).toEqual(1);
        expect(user.subscriptionID).toEqual(defaults.subscriptionID);
        expect(user.isSubscribed).toEqual(true);
    })

    it("should cancel subscription", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.processSubscriptionPayment(defaults.userID,defaults.subscriptionID)).toEqual(true);
        expect(await handler.cancelSubscription(defaults.userID, true)).toEqual(true);

        const user = await handler.getProfile(defaults.userID) as User;
        expect(user.isSubscribed).toEqual(false);
        expect(user.subscriptionID != null).toEqual(true);
        expect(getMonthDiff(new Date(),user.subscribeEnd)).toEqual(1);
    })

    it("should resubscribe user after break", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        expect(await handler.processSubscriptionPayment(defaults.userID, defaults.subscriptionID)).toEqual(true);
        const first = await handler.getProfile(defaults.userID) as User;
        expect(await handler.processSubscriptionPayment(defaults.userID, defaults.subscriptionID)).toEqual(true);
        const next = await handler.getProfile(defaults.userID) as User;

        expect(getMonthDiff(first.subscribeEnd,next.subscribeEnd)).toEqual(0);
    })
})