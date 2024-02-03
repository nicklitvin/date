import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { globals } from "../src/globals";
import { createUserInput, validRequestUserInput } from "./user.test";
import { User } from "@prisma/client";
import { makeMessageInputWithOneRandom, makeMessageInputWithRandoms } from "./message.test";

afterEach( async () => {
    await handler.deleteEverything()
})

const makeTwoUsersAndMatch = async () => {
    const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
    const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));
    await Promise.all([
        handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Like"
        }),
        handler.makeSwipe({
            userID: user_2.id,
            swipedUserID: user.id,
            action: "Like"
        })
    ])
    return {user, user_2};
}

describe("handler", () => {
    it("handler should not create user with invalid input", async () => {
        const invalidInput = await validRequestUserInput();
        invalidInput.age = globals.minAge - 1;

        expect(await handler.createUser(invalidInput)).toEqual(null);
    })

    it("handler should not create existing user", async () => {
        expect(await handler.createUser(await validRequestUserInput())).not.toEqual(null);
        expect(await handler.createUser(await validRequestUserInput())).toEqual(null);
    })

    it("handler should not delete nonuser", async () => {
        expect(await handler.deleteUser("random")).toEqual(null);
    })

    it("handler should delete user ", async () => {
        const user = await handler.createUser(await validRequestUserInput()) as User;
        
        await Promise.all([
            handler.message.sendMessage(makeMessageInputWithOneRandom(user.id)),
            handler.message.sendMessage(makeMessageInputWithOneRandom(user.id,true)),
            handler.message.sendMessage(makeMessageInputWithRandoms()),
        ])

        const deleted = await handler.deleteUser(user.id);
        expect(deleted?.user).toEqual(user);
        expect(deleted?.images).toEqual(user.images.length);
        expect(deleted?.messages).toEqual(2);
    })

    it("handler should no swipe if nonusers", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));

        expect(await handler.makeSwipe({
            userID: user.id,
            swipedUserID: "random",
            action: "Like"
        })).toEqual(null);

        expect(await handler.makeSwipe({
            userID: "random",
            swipedUserID: user.id,
            action: "Like"
        })).toEqual(null);
    })

    it("should not swipe if already done", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));

        expect(await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Dislike"
        })).not.toEqual(null);

        expect(await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Dislike"
        })).toEqual(null);
    })

    it("should not swipe self", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user.id,
            action: "Dislike"
        })).toEqual(null);
    })

    it("should not send message if not match 1", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));

        expect(await handler.sendMessage({
            userID: "random",
            recepientID: user_2.id,
            message: ""
        })).toEqual(null);
        expect(await handler.sendMessage({
            userID: user.id,
            recepientID: "random",
            message: ""
        })).toEqual(null);
    })

    it("should not send message if not match 2", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));

        await handler.swipe.createSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Like"
        })
        expect(await handler.sendMessage({
            userID: user.id,
            recepientID: user_2.id,
            message: ""
        })).toEqual(null);

        await handler.swipe.createSwipe({
            userID: user_2.id,
            swipedUserID: user.id,
            action: "Dislike"
        })
        expect(await handler.sendMessage({
            userID: user.id,
            recepientID: user_2.id,
            message: ""
        })).toEqual(null);
    })

    it("should send message to match", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        expect(await handler.sendMessage({
            userID: user.id,
            recepientID: user_2.id,
            message: ""
        })).not.toEqual(null);
        expect(await handler.sendMessage({
            userID: user_2.id,
            recepientID: user.id,
            message: ""
        })).not.toEqual(null);
    })
})