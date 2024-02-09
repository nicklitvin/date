import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { Swipe } from "@prisma/client";
import { randomUUID } from "crypto";
import { startOfWeek, subWeeks } from "date-fns";
import { createSwipeInput } from "./utils/easySetup";

afterEach( async () => {
    await handler.swipe.deleteAllSwipes();
})

describe("swipe", () => {
    const funcs = handler.swipe;
    const userID = "userID";
    const userID_2 = "userID_2";

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
        const initial = await funcs.createSwipe(
            createSwipeInput("Like"), new Date(0)
        ) as Swipe;
        const updated = await funcs.updateSwipe(
            initial.id, "Dislike"
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
            funcs.createSwipe(createSwipeInput("Like",userID)),
            funcs.createSwipe(createSwipeInput("Like",userID)),
            funcs.createSwipe(createSwipeInput("Like",userID))
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
            funcs.createSwipe(createSwipeInput("Like",userID), new Date(10)),
            funcs.createSwipe(createSwipeInput("Like",userID), week1Start),
            funcs.createSwipe(createSwipeInput("Like",userID), week1Start),
            funcs.createSwipe(createSwipeInput("Dislike",userID), week3Start),

            funcs.createSwipe(createSwipeInput("Like",randomUUID(),userID), week2Start),
            funcs.createSwipe(createSwipeInput("Dislike",randomUUID(),userID), week2Start),
            funcs.createSwipe(createSwipeInput("Dislike",randomUUID(),userID), new Date())
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

    it("should get all matches", async () => {
        const userID_3 = "userID_3";

        await Promise.all([
            funcs.createSwipe(createSwipeInput("Like",userID,userID_2), new Date(1)),
            funcs.createSwipe(createSwipeInput("Like",userID,userID_3),new Date(2)),
            funcs.createSwipe(createSwipeInput("Like",userID)),
            funcs.createSwipe(createSwipeInput("Dislike",userID)),

            funcs.createSwipe(createSwipeInput("Like",userID_2,userID), new Date(4)),
            funcs.createSwipe(createSwipeInput("Like",userID_3,userID), new Date(3)),
            funcs.createSwipe(createSwipeInput("Like",randomUUID(),userID)),
            funcs.createSwipe(createSwipeInput("Dislike",randomUUID(),userID)),
        ])


        const matches = await funcs.getAllMatches(userID,new Date(5));
        expect(matches).toHaveLength(2);
        expect(matches[0]).toEqual(userID_2);
        expect(matches[1]).toEqual(userID_3);

        const matches_2 = await funcs.getAllMatches(userID,new Date(3));
        expect(matches_2).toHaveLength(1);
        expect(matches_2[0]).toEqual(userID_3);
    })

    it("should get likedMe users", async () => {
        await Promise.all([
            funcs.createSwipe(createSwipeInput("Like",randomUUID(),userID)),
            funcs.createSwipe(createSwipeInput("Like",randomUUID(),userID)),
            funcs.createSwipe(createSwipeInput("Like",userID,randomUUID())),
            funcs.createSwipe(createSwipeInput("Dislike",randomUUID(),userID))
        ])

        expect(await funcs.getLikedMeUsers(userID)).toHaveLength(2);
    })

    it("should get my swiped users", async () => {
        await Promise.all([
            funcs.createSwipe(createSwipeInput("Like",userID)),
            funcs.createSwipe(createSwipeInput("Like",userID)),
            funcs.createSwipe(createSwipeInput("Dislike",userID,randomUUID())),
            funcs.createSwipe(createSwipeInput("Like",randomUUID(),userID))
        ])

        expect(await funcs.getSwipedUsers(userID)).toHaveLength(3);
    })
})