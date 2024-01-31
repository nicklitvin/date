import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { SwipeInput } from "../src/types";
import { Opinion, Swipe } from "@prisma/client";
import { randomUUID } from "crypto";

afterEach( async () => {
    await handler.swipe.deleteAllSwipes();
})

describe("swipe", () => {
    const funcs = handler.swipe;
    const createSwipeInput = (opinion : Opinion, randomUserID = false) : 
        SwipeInput => 
    {
        return {
            userID: randomUserID ? randomUUID() : "userID",
            swipedUserID: "userID_2",
            action: opinion
        }
    }

    it("should create swipe", async () => {
        expect(await funcs.createSwipe(createSwipeInput("Like"))).not.toEqual(null);
    })

    it("should not create duplicate swipe", async () => {
        await funcs.createSwipe(createSwipeInput("Like"));
        expect(await funcs.createSwipe(createSwipeInput("Dislike"))).toEqual(null);
    })

    it("should update swipe", async () => {
        const initial = await funcs.createSwipe(createSwipeInput("Like")) as Swipe;
        await new Promise( (res) => {
            setTimeout( () => {
                res(null)
            }, 1)
        })
        const updated = await funcs.updateSwipe(
            initial.id, createSwipeInput("Dislike")
        ) as Swipe;

        expect(updated.action).toEqual("Dislike");
        expect(updated.timestamp.getTime()).not.toEqual(initial.timestamp.getTime())
    })

    it("should get swipe", async () => {
        const swipe = await funcs.createSwipe(createSwipeInput("Like")) as Swipe;
        expect(await funcs.getSwipe(swipe.id)).toEqual(swipe);
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
})