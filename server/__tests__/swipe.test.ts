import { describe, expect, it } from "@jest/globals";
import { createSampleUser, createTwoUsersInSameUni, defaults, handler, prismaManager } from "../jest.setup";

describe("swipe", () => {
    it("should not get feed for nonuser", async () => {
        const swipeFeed = await handler.getSwipeFeed(defaults.userID);
        expect(swipeFeed.feed.length).toEqual(0);
        expect(swipeFeed.likedMeIDs.length).toEqual(0);
    })

    it("should not show self in feed", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        const swipeFeed = await handler.getSwipeFeed(defaults.userID);
        expect(swipeFeed.feed.length).toEqual(0);
        expect(swipeFeed.likedMeIDs.length).toEqual(0);
    })

    it("should not show diff uni in feed", async () => {
        const user1 = createSampleUser(defaults.userID);
        const user2 = createSampleUser(defaults.userID_2);
        user1.email = defaults.calEmail;
        user1.university = defaults.calName;
        user2.email = defaults.stanfordEmail;
        user2.university = defaults.stanfordName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.createUser(user2)).toEqual(true);

        const swipeFeed = await handler.getSwipeFeed(defaults.userID);
        expect(swipeFeed.feed.length).toEqual(0);
        expect(swipeFeed.likedMeIDs.length).toEqual(0);  

        const swipeFeed_2 = await handler.getSwipeFeed(defaults.userID_2);
        expect(swipeFeed_2.feed.length).toEqual(0);
        expect(swipeFeed_2.likedMeIDs.length).toEqual(0);  
    })

    it("show same uni in feed", async () => {
        const { user2 } = await createTwoUsersInSameUni();

        const swipeFeed = await handler.getSwipeFeed(defaults.userID);
        expect(swipeFeed.feed.length).toEqual(1);
        expect(swipeFeed.likedMeIDs.length).toEqual(0);  
        expect(swipeFeed.feed[0].id).toEqual(user2.id);
    })

    it("should not let nonuser swipe", async () => {
        const user1 = createSampleUser(defaults.userID);
        user1.email = defaults.calEmail;
        user1.university = defaults.calName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.makeSwipe(defaults.badID, defaults.userID, "Like")).toEqual(false);
    })

    it("should not swipe on nonuser", async () => {
        const user1 = createSampleUser(defaults.userID);
        user1.email = defaults.calEmail;
        user1.university = defaults.calName;

        expect(await handler.createUser(user1)).toEqual(true);
        expect(await handler.makeSwipe(defaults.userID, defaults.badID, "Like")).toEqual(false);
    })

    it("should create swipe", async () => {
        await createTwoUsersInSameUni();

        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2,"Like")).toEqual(true);
        const swipe = await prismaManager.getSwipe(defaults.userID,defaults.userID_2);
        expect(swipe?.action === "Like").toEqual(true);
    })

    it("should update swipe", async () => {
        await createTwoUsersInSameUni();

        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2,"Like")).toEqual(true);
        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2,"Dislike")).toEqual(true);
        const swipe = await prismaManager.getSwipe(defaults.userID,defaults.userID_2);
        expect(swipe?.action === "Dislike").toEqual(true);
    })

    it("should not show user after swiping", async () => {
        await createTwoUsersInSameUni();

        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2,"Like")).toEqual(true);
        const swipeFeed = await handler.getSwipeFeed(defaults.userID);
        expect(swipeFeed.feed.length).toEqual(0);
        
        const swipeFeed_2 = await handler.getSwipeFeed(defaults.userID_2);
        expect(swipeFeed_2.likedMeIDs.length).toEqual(1);
        expect(swipeFeed_2.likedMeIDs[0]).toEqual(defaults.userID);
    })

    it("should not show user after dislike", async () => {
        await createTwoUsersInSameUni();

        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2,"Dislike")).toEqual(true);
        const swipeFeed = await handler.getSwipeFeed(defaults.userID);
        expect(swipeFeed.feed.length).toEqual(0);
        
        const swipeFeed_2 = await handler.getSwipeFeed(defaults.userID_2);
        expect(swipeFeed_2.likedMeIDs.length).toEqual(0);
    })

    it("should show users that liked me first", async () => {
        await createTwoUsersInSameUni();

        const user3 = createSampleUser(defaults.userID_3);
        user3.email = defaults.calEmail_3;
        user3.university = defaults.calName;

        expect(await handler.createUser(user3)).toEqual(true);
        expect(await handler.makeSwipe(defaults.userID_3, defaults.userID_2,"Like")).toEqual(true);
        const swipeFeed = await handler.getSwipeFeed(defaults.userID_2);

        expect(swipeFeed.feed.length).toEqual(2);
        expect(swipeFeed.feed[0].id).toEqual(defaults.userID_3);
        expect(swipeFeed.feed[1].id).toEqual(defaults.userID);
    })

    it("should delete swipes if user deletes account", async () => {
        await createTwoUsersInSameUni();

        expect(await handler.makeSwipe(defaults.userID, defaults.userID_2,"Like")).toEqual(true);
        expect(await prismaManager.getSwipeCount(defaults.userID)).toEqual(1);

        expect(await handler.deleteUser(defaults.userID)).toEqual(true);
        expect(await prismaManager.getSwipeCount(defaults.userID)).toEqual(0);
    })

    it("should not delete swipes is other user deletes account", async () => {
        await createTwoUsersInSameUni();

        const user3 = createSampleUser(defaults.userID_3);
        user3.email = defaults.calEmail_3;
        user3.university = defaults.calName;
        expect(await handler.createUser(user3)).toEqual(true);

        expect(await handler.makeSwipe(defaults.userID_2, defaults.userID_3, "Like")).toEqual(true);
        expect(await handler.deleteUser(defaults.userID)).toEqual(true);
        expect(await prismaManager.getSwipeCount()).toEqual(1);
    })

    it("should not swipe self", async () => {
        await createTwoUsersInSameUni();
        expect(await handler.makeSwipe(defaults.userID, defaults.userID, "Like")).toEqual(false);
    })
})