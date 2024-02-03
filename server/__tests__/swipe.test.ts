import { afterEach, describe, expect, it } from "@jest/globals";
import { handler, waitOneMoment } from "../jest.setup";
import { SwipeInput } from "../src/interfaces";
import { Opinion, Swipe } from "@prisma/client";
import { randomUUID } from "crypto";
import { startOfWeek, subWeeks } from "date-fns";

afterEach( async () => {
    await handler.swipe.deleteAllSwipes();
})

describe("swipe", () => {
    const funcs = handler.swipe;
    const userID = "userID";
    const userID_2 = "userID_2";

    const createSwipeInput = (opinion : Opinion, randomUserID = false, 
        randomSwipedUserID = false) : SwipeInput => 
    {
        return {
            userID: randomUserID ? randomUUID() : userID,
            swipedUserID: randomSwipedUserID ? randomUUID() : userID_2,
            action: opinion
        }
    }

    const createReverseSwipeInput = (opinion : Opinion) : SwipeInput => {
        return {
            userID: randomUUID(),
            swipedUserID: userID,
            action: opinion
        }
    }

    it("should create swipe", async () => {
        expect(await funcs.createSwipe(createSwipeInput("Like"))).not.toEqual(null);
    })

    it("should get swipe", async () => {
        const swipe = await funcs.createSwipe(createSwipeInput("Like"));
        expect(await funcs.getSwipeByUsers(swipe.userID, swipe.swipedUserID)).toEqual(
            swipe
        );
        expect(await funcs.getSwipeByID(swipe.id)).toEqual(swipe);
    })

    it("should update swipe", async () => {
        const initial = await funcs.createSwipe(createSwipeInput("Like")) as Swipe;
        await waitOneMoment();
        const updated = await funcs.updateSwipe(
            initial.id, createSwipeInput("Dislike")
        ) as Swipe;

        expect(updated.action).toEqual("Dislike");
        expect(updated.timestamp.getTime()).not.toEqual(initial.timestamp.getTime())
    })

    it("should not delete nonswipe", async () => {
        expect(await funcs.deleteSwipe("bad")).toEqual(null);  
    })

    it("should delete swipe", async () => {
        const swipe = await funcs.createSwipe(createSwipeInput("Like")) as Swipe;
        expect(await funcs.deleteSwipe(swipe.id)).toEqual(swipe);
    })

    it("should delete all swipes", async () => {
        await Promise.all([
            funcs.createSwipe(createSwipeInput("Like",true)),
            funcs.createSwipe(createSwipeInput("Like",true)),
            funcs.createSwipe(createSwipeInput("Like",true))
        ])

        expect(await funcs.deleteAllSwipes()).toEqual(3);
    })

    it("should get user swipe stats for nonuser", async () => {
        const stats = await funcs.getUserSwipeStats(userID);
        expect(stats.allTime.myLikes).toEqual(0);
        expect(stats.allTime.myDislikes).toEqual(0);
        expect(stats.allTime.likedMe).toEqual(0);
        expect(stats.allTime.dislikedMe).toEqual(0);
    })

    it("should get user swipe stats", async () => {
        const week0Start = startOfWeek(new Date());
        const week1Start = subWeeks(week0Start, 1);
        const week2Start = subWeeks(week0Start, 2);
        const week3Start = subWeeks(week0Start, 3);

        await Promise.all([
            funcs.createSwipe(createSwipeInput("Like",false,true), new Date(10)),
            funcs.createSwipe(createSwipeInput("Like",false,true), week1Start),
            funcs.createSwipe(createSwipeInput("Like",false,true), week1Start),
            funcs.createSwipe(createSwipeInput("Dislike",false,true), week3Start),

            funcs.createSwipe(createReverseSwipeInput("Like"), week2Start),
            funcs.createSwipe(createReverseSwipeInput("Dislike"), week2Start),
            funcs.createSwipe(createReverseSwipeInput("Dislike"), new Date()),
        ])

        const stats = await funcs.getUserSwipeStats(userID);
        expect(stats.allTime.myLikes).toEqual(3);
        expect(stats.allTime.myDislikes).toEqual(1);
        expect(stats.allTime.likedMe).toEqual(1);
        expect(stats.allTime.dislikedMe).toEqual(2);

        expect(stats.weekly[1].myLikes).toEqual(2);
        expect(stats.weekly[3].myDislikes).toEqual(1);

        expect(stats.weekly[0].dislikedMe).toEqual(1);
        expect(stats.weekly[2].likedMe).toEqual(1);
        expect(stats.weekly[2].dislikedMe).toEqual(1);
    })
})