import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { globals } from "../src/globals";
import { createUserInput, validRequestUserInput } from "./user.test";
import { User } from "@prisma/client";
import { makeMessageInputWithOneRandom, makeMessageInputWithRandoms } from "./message.test";
import { ChatPreview } from "../src/interfaces";

afterEach( async () => {
    await handler.deleteEverything()
})

const matchUsers = async (userID : string, userID_2 : string) => {
    await Promise.all([
        handler.makeSwipe({
            userID: userID,
            swipedUserID: userID_2,
            action: "Like"
        }),
        handler.makeSwipe({
            userID: userID_2,
            swipedUserID: userID,
            action: "Like"
        })
    ])
}

const makeTwoUsersAndMatch = async () => {
    const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
    const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));
    await matchUsers(user.id, user_2.id);
    return {user, user_2};
}

describe("handler", () => {
    it("should not create user with invalid input", async () => {
        const invalidInput = await validRequestUserInput();
        invalidInput.age = globals.minAge - 1;

        expect(await handler.createUser(invalidInput)).toEqual(null);
    })

    it("should not create existing user", async () => {
        expect(await handler.createUser(await validRequestUserInput())).not.toEqual(null);
        expect(await handler.createUser(await validRequestUserInput())).toEqual(null);
    })

    it("should not delete nonuser", async () => {
        expect(await handler.deleteUser("random")).toEqual(null);
    })

    it("should delete user ", async () => {
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

    it("should no swipe if nonusers", async () => {
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

    it("should not get chat preview for nonuser", async () => {
        expect(await handler.getChatPreviews({
            userID: "random",
            timestamp: new Date()
        })).toEqual(null);
    })

    it("should get chat preview", async () => {
        const [user, user_2, user_3] = await Promise.all([
            handler.user.createUser(createUserInput("a@berkeley.edu")),
            handler.user.createUser(createUserInput("b@berkeley.edu")),
            handler.user.createUser(createUserInput("c@berkeley.edu"))
        ])
        await Promise.all([
            matchUsers(user.id, user_2.id),
            matchUsers(user.id, user_3.id),
            matchUsers(user_2.id, user_3.id),
        ])

        const [m1, m2, m3] = await Promise.all([
            handler.message.sendMessage({
                userID: user.id,
                recepientID: user_2.id,
                message: ""
            }, new Date(10)),
            handler.message.sendMessage({
                userID: user_2.id,
                recepientID: user.id,
                message: ""
            }, new Date(15)),
            handler.message.sendMessage({
                userID: user.id,
                recepientID: user_3.id,
                message: ""
            }, new Date(20)),
        ])

        const previews = await handler.getChatPreviews({
            userID: user.id,
            timestamp: new Date()
        }) as ChatPreview[];
        expect(previews.length).toEqual(2);
        expect(previews[0].profile.id).toEqual(user_3.id);
        expect(previews[0].messages[0].id).toEqual(m3.id);
        expect(previews[1].profile.id).toEqual(user_2.id);
        expect(previews[1].messages[0].id).toEqual(m2.id);
        expect(previews[1].messages[1].id).toEqual(m1.id);
    })

    it("should not get chat preview if no messages", async () => {
        const {user} = await makeTwoUsersAndMatch();
        const previews = await handler.getChatPreviews({
            userID: user.id,
            timestamp: new Date()
        })
        expect(previews?.length).toEqual(0);
    })
})