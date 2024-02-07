import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { globals } from "../src/globals";
import { User } from "@prisma/client";
import { ChatPreview, PublicProfile } from "../src/interfaces";
import { randomUUID } from "crypto";
import { createUserInput, getImageDetails, makeMessageInputWithOneRandom, makeMessageInputWithRandoms, makeTwoUsersAndMatch, matchUsers, validRequestUserInput } from "./utils/easySetup";

afterEach( async () => {
    await handler.deleteEverything()
})

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

    it("should not add report from nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.reportUser({
            userID: "random",
            reportedID: user.id
        })).toEqual(null);
    })

    it("should not report nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.reportUser({
            userID: user.id,
            reportedID: "random"
        })).toEqual(null);
    })

    it("should not report self", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.reportUser({
            userID: user.id,
            reportedID: user.id
        })).toEqual(null);
    })

    it("should report user, unmatch, and delete chat", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        await Promise.all([
            handler.message.sendMessage({
                userID: user.id,
                message: "",
                recepientID: user_2.id
            }),
            handler.message.sendMessage({
                userID: user_2.id,
                message: "",
                recepientID: user.id
            })
        ])

        expect(await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id
        })).not.toEqual(null);        

        const [userOpinion, user2Opinion, chat] = await Promise.all([
            handler.swipe.getSwipeByUsers(user.id, user_2.id),
            handler.swipe.getSwipeByUsers(user_2.id, user.id),
            handler.message.getChat({
                userID: user.id,
                withID: user_2.id,
                fromTime: new Date()
            })
        ]);

        expect(userOpinion?.action).toEqual("Dislike");
        expect(user2Opinion?.action).toEqual("Like");
        expect(chat).toHaveLength(0);
    })

    it("should delete user after enough reports", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        await Promise.all(
            Array.from({length: globals.maxReportCount}, () => randomUUID()).map(
                (val) => handler.report.makeReport({
                    userID: val,
                    reportedEmail: user_2.email
                })
            )
        )

        await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id
        })
        expect(await handler.user.getUserByID(user_2.id)).toEqual(null);
    })

    it("should no upload image for nonuser", async () => {
        expect(await handler.uploadImage({
            userID: "random",
            image: await getImageDetails(true)
        })).toEqual(null);
    })

    it("should not upload bad image", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.uploadImage({
            userID: user.id,
            image: await getImageDetails(false)
        })).toEqual(null);
    })

    it("should not upload over max images", async () => {
        const userInput = createUserInput("a@berkeley.edu");
        const maxImages = Array.from({length: globals.maxImagesCount}).fill(
            "imageID") as string[];
        userInput.images = maxImages;

        const user = await handler.user.createUser(userInput);
        expect(await handler.uploadImage({
            userID: user.id,
            image: await getImageDetails(true)
        })).toEqual(null);
    })

    it("should upload image", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const after = await handler.uploadImage({
            userID: user.id,
            image: await getImageDetails(true)
        });

        expect(after).not.toEqual(null);
        expect(after?.images.length).toEqual(user.images.length + 1);
    })

    it("should not delete image from nonuser", async () => {
        expect(await handler.deleteImage({
            userID: "random",
            imageID: "imageID"
        })).toEqual(null);
    })

    it("should not delete nonimage from user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.deleteImage({
            userID: user.id,
            imageID: "random"
        })).toEqual(null);
    })

    it("should delete image from user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.deleteImage({
            userID: user.id,
            imageID: user.images[0]
        })).not.toEqual(null);
    })

    it("should not edit nonnuser", async () => {
        expect(await handler.editUser({
            userID: "random",
            setting: "email",
            value: "1"
        })).toEqual(null);
    })

    it("should not edit not allowed attribute", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.editUser({
            userID: user.id,
            setting: "age",
            value: "12"
        })).toEqual(null);
    })

    it("should edit user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.editUser({
            userID: user.id,
            setting: "age",
            value: 12
        })).not.toEqual(null);
    })

    it("should not change image order of nonuser", async () => {
        expect(await handler.changeImageOrder({
            userID: "random",
            setting: "images",
            value: ["1","2"]
        })).toEqual(null);
    })

    it("should not change image order with bad input", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: "1"
        })).toEqual(null);
    })

    it("should not change image order if images dont match", async () => {
        const userInput = createUserInput("a@berkeley.edu");
        userInput.images = ["1","2"];

        const user = await handler.user.createUser(userInput);
        expect(await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: ["1"]
        })).toEqual(null);
        expect(await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: ["1","2","3"]
        })).toEqual(null);
        expect(await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: [1,2]
        })).toEqual(null);
    })

    it("should change image order", async () => {
        const userInput = createUserInput("a@berkeley.edu");
        userInput.images = ["1","2"];

        const user = await handler.user.createUser(userInput);
        const after = await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: ["2","1"]
        })
        expect(after?.images.length).toEqual(2);
        expect(after?.images[0]).toEqual(userInput.images[1]);
        expect(after?.images[1]).toEqual(userInput.images[0]);
    })

    it("should not create checkout page for nonuser", async () => {
        expect(await handler.getSubscriptionCheckoutPage("random")).toEqual(null);
    })

    it("should create checkout page for user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.getSubscriptionCheckoutPage(user.id)).not.toEqual(null);
    })

    it("should not cancel subscription for nonuser", async () => {
        expect(await handler.cancelSubscription("random")).toEqual(null);
    })

    it("should not cancel subscription if user has none", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.cancelSubscription(user.id)).toEqual(null);
    })

    it("should cancel subscription for user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        await handler.user.updateSubscriptionAfterPay(user.id, "subscriptionId");
        
        const after = await handler.cancelSubscription(user.id) as User;
        expect(after.isSubscribed).toEqual(false);
        expect(after.subscriptionID).toEqual(null);
    })

    it("should not unlike if nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.unlike({
            userID: "random",
            withID: user.id
        })).toEqual(null);
    })

    it("should not unlike from nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.unlike({
            userID: user.id,
            withID: "random"
        })).toEqual(null);
    })

    it("should not unlike if not liked", async () => {
        const [user, user_2] = await Promise.all([
            handler.user.createUser(createUserInput("a@berkeley.edu")),
            handler.user.createUser(createUserInput("b@berkeley.edu"))
        ]);

        expect(await handler.unlike({
            userID: user.id,
            withID: user_2.id
        })).toEqual(null);
    })

    it("should unlike and delete chat", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        await Promise.all([
            handler.message.sendMessage({
                userID: user.id,
                message: "",
                recepientID: user_2.id
            }),
            handler.message.sendMessage({
                userID: user_2.id,
                message: "",
                recepientID: user.id
            })
        ]);

        const deleted = await handler.unlike({
            userID: user.id,
            withID: user_2.id
        })
        expect(deleted?.deletedMessages).toEqual(2);
        expect(deleted?.newSwipe).not.toEqual(null);
    })

    it("should not get new matches from nonuser", async () => {
        expect(await handler.getNewMatches({
            userID: "random",
            fromTime: new Date()
        })).toEqual(null);
    })

    it("should not get new matches if sent message", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        await handler.message.sendMessage({
            message: "",
            userID: user.id,
            recepientID: user_2.id
        });
        const newMatches = await handler.getNewMatches({
            userID: user.id,
            fromTime: new Date()
        }) as PublicProfile[];

        expect(newMatches).toHaveLength(0);
    })

    it("should get new matches", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        const newMatches = await handler.getNewMatches({
            userID: user.id,
            fromTime: new Date()
        }) as PublicProfile[];

        expect(newMatches).toHaveLength(1);
        expect(newMatches[0].id).toEqual(user_2.id)
    })
})