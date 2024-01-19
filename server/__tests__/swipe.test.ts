import { describe, expect, it } from "@jest/globals";
import { createSampleUser, handler, prismaManager } from "../jest.setup";

describe("swipe", () => {
    const badID = "bad";
    const userID = "1";
    const userID_2 = "2";
    const calEmail = "a@berkeley.edu";
    const calEmail_2 = "b@berkeley.edu";
    const calName = "berkeley";
    const stanfordEmail = "a@stanford.edu";
    const stanfordName = "stanford";
    
    it("should not get feed for nonuser", async () => {
        const swipeFeed = await handler.getSwipeFeed(userID)
        expect(swipeFeed.feed).toEqual([]);
        expect(swipeFeed.likedMeIDs).toEqual([]);
    })

    it("should not show self in feed", async () => {
        expect(await handler.createUser(createSampleUser(userID))).toEqual(true);
        const swipeFeed = await handler.getSwipeFeed(userID)
        expect(swipeFeed.feed.length).toEqual(0);
        expect(swipeFeed.likedMeIDs.length).toEqual(0);
    })

    it("should not show diff uni in feed", async () => {
        const user1 = createSampleUser(userID);
        const user2 = createSampleUser(userID_2);
        user1.email = calEmail;
        user1.university = calName;
        user2.email = stanfordEmail;
        user2.university = stanfordName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.createUser(user2)).toEqual(true);

        const swipeFeed = await handler.getSwipeFeed(userID);
        expect(swipeFeed.feed.length).toEqual(0);
        expect(swipeFeed.likedMeIDs.length).toEqual(0);  

        const swipeFeed_2 = await handler.getSwipeFeed(userID_2);
        expect(swipeFeed_2.feed.length).toEqual(0);
        expect(swipeFeed_2.likedMeIDs.length).toEqual(0);  
    })

    it("show same uni in feed", async () => {
        const user1 = createSampleUser(userID);
        const user2 = createSampleUser(userID_2);
        user1.email = calEmail;
        user1.university = calName;
        user2.email = calEmail_2;
        user2.university = calName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.createUser(user2)).toEqual(true);

        const swipeFeed = await handler.getSwipeFeed(userID);
        expect(swipeFeed.feed.length).toEqual(1);
        expect(swipeFeed.likedMeIDs.length).toEqual(0);  
        expect(swipeFeed.feed[0].id).toEqual(user2.id);
    })

    it("should not let nonuser swipe", async () => {
        const user1 = createSampleUser(userID);
        user1.email = calEmail;
        user1.university = calName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.makeSwipe(badID, userID, "Like")).toEqual(false);
    })

    it("should not swipe on nonuser", async () => {
        const user1 = createSampleUser(userID);
        user1.email = calEmail;
        user1.university = calName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.makeSwipe(userID, badID, "Like")).toEqual(false);
    })

    it("should create swipe", async () => {
        const user1 = createSampleUser(userID);
        user1.email = calEmail;
        user1.university = calName;

        const user2 = createSampleUser(userID_2);
        user2.email = calEmail;
        user2.university = calName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.createUser(user2)).toEqual(true);

        expect(await handler.makeSwipe(userID, userID_2,"Like")).toEqual(true);
        const swipe = await prismaManager.getSwipe(userID,userID_2);
        expect(swipe?.action === "Like").toEqual(true);
    })

    it("should update swipe", async () => {
        const user1 = createSampleUser(userID);
        user1.email = calEmail;
        user1.university = calName;

        const user2 = createSampleUser(userID_2);
        user2.email = calEmail;
        user2.university = calName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.createUser(user2)).toEqual(true);

        expect(await handler.makeSwipe(userID, userID_2,"Like")).toEqual(true);
        expect(await handler.makeSwipe(userID, userID_2,"Dislike")).toEqual(true);
        const swipe = await prismaManager.getSwipe(userID,userID_2);
        expect(swipe?.action === "Dislike").toEqual(true);
    })
})