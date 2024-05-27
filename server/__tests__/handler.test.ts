import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { Message, User } from "@prisma/client";
import { ChatPreview, NewMatchData, UserReportInput } from "../src/interfaces";
import { randomUUID } from "crypto";
import { createReportInput, createUserInput, createUsersForSwipeFeed, getImageDetails, makeAnnouncementInput, makeMessageInputWithOneRandom, makeMessageInputWithRandoms, makeMockWebSocket, makeTwoUsers, makeTwoUsersAndMatch, makeVerificationInput, matchUsers, validRequestUserInput } from "../__testUtils__/easySetup";
import { addMinutes, addWeeks, addYears } from "date-fns";
import { errorText, miscConstants, sampleContent, userRestrictions } from "../src/globals";

afterEach( async () => {
    await handler.deleteEverything()
})

describe("handler", () => {
    it("should not create user with invalid input", async () => {
        const invalidInput = await validRequestUserInput();
        invalidInput.birthday = addYears(new Date(), -(userRestrictions.minAge - 1))

        const output = await handler.createUser(invalidInput);
        expect(output.message).toEqual(errorText.invalidUserInput);
    })

    it("should not create existing user", async () => {
        await handler.createUser(await validRequestUserInput());
        const output = await handler.createUser(await validRequestUserInput());
        expect(output.message).toEqual(errorText.userAlreadyExists);
    })

    it("should not delete nonuser", async () => {
        const output = await handler.deleteUser("random");
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should delete user ", async () => {
        const created = await handler.createUser(await validRequestUserInput());
        const user = created.data as User;

        await Promise.all([
            handler.message.sendMessage(makeMessageInputWithOneRandom(user.id)),
            handler.message.sendMessage(makeMessageInputWithOneRandom(user.id,true)),
            handler.message.sendMessage(makeMessageInputWithRandoms()),
        ])

        const deleted = await handler.deleteUser(user.id);
        expect(deleted?.data?.user).toEqual(user);
        expect(deleted?.data?.images).toEqual(user.images.length);
        expect(deleted?.data?.messages).toEqual(2);
    })

    it("should no swipe if nonusers", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));

        const output = await handler.makeSwipe({
            userID: user.id,
            swipedUserID: "random",
            action: "Like"
        });
        expect(output.message).toEqual(errorText.notValidUser);

        const output1 = await handler.makeSwipe({
            userID: "random",
            swipedUserID: user.id,
            action: "Like"
        })
        expect(output1.message).toEqual(errorText.notValidUser);
    })

    it("should not swipe if already done", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));


        await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Dislike"
        })

        const output = await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Dislike"
        });
        expect(output.message).toEqual(errorText.cannotSwipeAgain);
    })

    it("should not swipe self", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user.id,
            action: "Dislike"
        });

        expect(output.message).toEqual(errorText.cannotSwipeSelf);
    })

    it("should not send message if not match 1", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));

        const output1 = await handler.sendMessage({
            userID: "random",
            recepientID: user_2.id,
            message: ""
        });
        expect(output1.message).toEqual(errorText.cannotSendMessage);

        const output2 = await handler.sendMessage({
            userID: user.id,
            recepientID: "random",
            message: ""
        });
        expect(output2.message).toEqual(errorText.cannotSendMessage);
    })

    it("should not send message if not match 2", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user_2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));

        await handler.swipe.createSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Like"
        })
        const output1 = await handler.sendMessage({
            userID: user.id,
            recepientID: user_2.id,
            message: ""
        });
        expect(output1.message).toEqual(errorText.cannotSendMessage);

        await handler.swipe.createSwipe({
            userID: user_2.id,
            swipedUserID: user.id,
            action: "Dislike"
        })
        const output2 = await handler.sendMessage({
            userID: user.id,
            recepientID: user_2.id,
            message: ""
        });
        expect(output2.message).toEqual(errorText.cannotSendMessage);
    })

    it("should send message to match", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        const output = await handler.sendMessage({
            userID: user.id,
            recepientID: user_2.id,
            message: ""
        })
        expect(output.data).not.toEqual(null);

        const output1 = await handler.sendMessage({
            userID: user_2.id,
            recepientID: user.id,
            message: ""
        });
        expect(output1.data).not.toEqual(null);
    })

    it("should not get chat preview for nonuser", async () => {
        const output = await handler.getChatPreviews({
            userID: "random",
            timestamp: new Date()
        })
        expect(output.message).toEqual(errorText.notValidUser);
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

        const output = await handler.getChatPreviews({
            userID: user.id,
            timestamp: new Date()
        });
        
        const previews = output.data!;
        expect(previews.length).toEqual(2);
        expect(previews[0].profile.id).toEqual(user_3.id);
        expect(previews[0].message.id).toEqual(m3.id);
        expect(previews[1].profile.id).toEqual(user_2.id);
        expect(previews[1].message.id).toEqual(m2.id);
    })

    it("should not get chat preview if no messages", async () => {
        const {user} = await makeTwoUsersAndMatch();
        const output = await handler.getChatPreviews({
            userID: user.id,
            timestamp: new Date()
        })
        expect(output.data?.length).toEqual(0);
    })

    it("should not add report from nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.reportUser({
            userID: "random",
            reportedID: user.id
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not report nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.reportUser({
            userID: user.id,
            reportedID: "random"
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not report self", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.reportUser({
            userID: user.id,
            reportedID: user.id
        });
        expect(output.message).toEqual(errorText.cannotReportSelf);
    })

    it("should not report twice", async () => {
        const { user, user_2 } = await makeTwoUsers();
        await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id,
        }, user_2.email)
        const output = await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id,
        }, user_2.email)
        expect(output.message).toEqual(errorText.cannotReportAgain);
    })

    it("should disliked swipe if report", async () => {
        const { user, user_2 } = await makeTwoUsers();
        await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id,
        }, user_2.email)
        const swipe = await handler.swipe.getSwipeByUsers(user.id, user_2.id);
        expect(swipe?.action).toEqual("Dislike");
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

        const output = await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id
        }, user_2.email);
        expect(output.data).not.toEqual(null);

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
            Array.from({length: miscConstants.maxReportCount}, () => randomUUID()).map(
                (val) => handler.report.makeReport({
                    userID: val,
                    reportedEmail: user_2.email
                })
            )
        )

        await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id
        }, user_2.email);

        expect(await handler.user.getUserByID(user_2.id)).toEqual(null);
        expect(await handler.swipe.getSwipeCountWithUser(user_2.id)).toEqual(0);
    })

    it("should no upload image for nonuser", async () => {
        const output = await handler.uploadImage({
            userID: "random",
            image: await getImageDetails(true)
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not upload bad image", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.uploadImage({
            userID: user.id,
            image: await getImageDetails(false)
        });
        expect(output.message).toEqual(errorText.invalidImageFormat);
    })

    it("should not upload over max images", async () => {
        const userInput = createUserInput("a@berkeley.edu");
        const maxImages = Array.from({length: userRestrictions.maxImagesCount}).fill(
            "imageID") as string[];
        userInput.images = maxImages;

        const user = await handler.user.createUser(userInput);
        const output = await handler.uploadImage({
            userID: user.id,
            image: await getImageDetails(true)
        });
        expect(output.message).toEqual(errorText.tooManyImages);
    })

    it("should upload image", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const after = await handler.uploadImage({
            userID: user.id,
            image: await getImageDetails(true)
        });

        expect(after?.data!.images.length).toEqual(user.images.length + 1);
    })

    it("should not delete image from nonuser", async () => {
        const output = await handler.deleteImage({
            userID: "random",
            imageID: "imageID"
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not delete nonimage from user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.deleteImage({
            userID: user.id,
            imageID: "random"
        });
        expect(output.message).toEqual(errorText.imageDoesNotExist);
    })

    it("should delete image from user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        await handler.uploadImage({
            image: {
                content: "a",
                mimetype: "image/jpeg"
            },
            userID: user.id
        })
        const output = await handler.deleteImage({
            userID: user.id,
            imageID: user.images[0]
        });
        expect(output.data).not.toEqual(null);
    })

    it("should not delete only image", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.deleteImage({
            userID: user.id,
            imageID: user.images[0]
        });
        expect(output.message).toEqual(errorText.cannotDeleteOnlyImage);
    })

    it("should not edit nonnuser", async () => {
        const output = await handler.editUser({
            userID: "random",
            setting: "email",
            value: "1"
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not edit not allowed attribute", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.editUser({
            userID: user.id,
            setting: "birthday",
            value: new Date()
        });
        expect(output.message).toEqual(errorText.invalidUserSetting);
    })

    it("should edit user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.editUser({
            userID: user.id,
            setting: "genderInterest",
            value: ["Female"]
        });
        expect(output.data).not.toEqual(null);
    })

    it("should not change image order of nonuser", async () => {
        const output = await handler.changeImageOrder({
            userID: "random",
            setting: "images",
            value: ["1","2"]
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not change image order with bad input", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: "1"
        });
        expect(output.message).toEqual(errorText.invalidImageOrder);
    })

    it("should not change image order if images dont match", async () => {
        const userInput = createUserInput("a@berkeley.edu");
        userInput.images = ["1","2"];

        const user = await handler.user.createUser(userInput);
        const output = await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: ["1"]
        });
        expect(output.message).toEqual(errorText.invalidImageOrder);

        const output1 = await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: ["1","2","3"]
        });
        expect(output1.message).toEqual(errorText.invalidImageOrder);

        const output2 = await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: [1,2]
        });
        expect(output2.message).toEqual(errorText.invalidImageOrder);
    })

    it("should change image order", async () => {
        const userInput = createUserInput("a@berkeley.edu");
        userInput.images = ["1","2"];

        const user = await handler.user.createUser(userInput);
        const output = await handler.changeImageOrder({
            userID: user.id,
            setting: "images",
            value: ["2","1"]
        })
        const after = output.data!;
        expect(after?.images.length).toEqual(2);
        expect(after?.images[0]).toEqual(userInput.images[1]);
        expect(after?.images[1]).toEqual(userInput.images[0]);
    })

    it("should not create checkout page for nonuser", async () => {
        const output = await handler.getSubscriptionCheckoutPage("random");
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should create checkout page for user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.getSubscriptionCheckoutPage(user.id);
        expect(output.data).not.toEqual(null);
    })

    it("should not create checkout page for user if already subscribed", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        await handler.processSubscriptionPay({subscriptionID: "random", userID: user.id});

        const output = await handler.getSubscriptionCheckoutPage(user.id);
        expect(output.message).toEqual(errorText.alreadySubscribed);
    })

    it("should not cancel subscription for nonuser", async () => {
        const output = await handler.cancelSubscription("random");
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not cancel subscription if user has none", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.cancelSubscription(user.id);
        expect(output.message).toEqual(errorText.noSubscription);
    })

    it("should cancel subscription for user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        await handler.user.updateSubscriptionAfterPay(user.id, "subscriptionId");
        
        const output = await handler.cancelSubscription(user.id);
        const after = output.data as User;
        expect(after.isSubscribed).toEqual(false);
        expect(after.subscriptionID).toEqual(null);
    })

    it("should not unlike if nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.unlike({
            userID: "random",
            withID: user.id
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not unlike from nonuser", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.unlike({
            userID: user.id,
            withID: "random"
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not unlike if not liked", async () => {
        const [user, user_2] = await Promise.all([
            handler.user.createUser(createUserInput("a@berkeley.edu")),
            handler.user.createUser(createUserInput("b@berkeley.edu"))
        ]);

        const output = await handler.unlike({
            userID: user.id,
            withID: user_2.id
        });
        expect(output.message).toEqual(errorText.cannotUnlike);
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

        const output = await handler.unlike({
            userID: user.id,
            withID: user_2.id
        })
        const deleted = output.data;
        expect(deleted?.deletedMessages).toEqual(2);
        expect(deleted?.newSwipe).not.toEqual(null);
    })

    it("should not get new matches from nonuser", async () => {
        const output = await handler.getNewMatches({
            userID: "random",
            timestamp: new Date()
        });
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not get new matches if sent message", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        await handler.message.sendMessage({
            message: "",
            userID: user.id,
            recepientID: user_2.id
        });
        const output = await handler.getNewMatches({
            userID: user.id,
            timestamp: new Date()
        });
        const newMatches = output.data;

        expect(newMatches).toHaveLength(0);
    })

    it("should get new matches", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));
        const user3 = await handler.user.createUser(createUserInput("c@berkeley.edu"));

        const match = await matchUsers(user.id, user2.id);
        const match2 = await matchUsers(user.id, user3.id);
        expect(match.getTime()).not.toEqual(match2.getTime());

        const output = await handler.getNewMatches({
            userID: user.id,
            timestamp: new Date()
        });
        const newMatches = output.data;

        expect(newMatches).toHaveLength(2);
        expect(newMatches![0].profile.id).toEqual(user3.id);
        expect(newMatches![0].timestamp.getTime()).toEqual(match2.getTime());
        expect(newMatches![1].profile.id).toEqual(user2.id);
        expect(newMatches![1].timestamp.getTime()).toEqual(match.getTime());

        const output1 = await handler.getNewMatches({
            userID: user.id,
            timestamp: new Date(match2.getTime() - 1)
        });
        const newMatches1 = output1.data;
        expect(newMatches1).toHaveLength(1);
        expect(newMatches1![0].profile.id).toEqual(user2.id);
        expect(newMatches1![0].timestamp.getTime()).toEqual(match.getTime());
    })

    it("should increase elo when user receives like", async () => {
        const {user, user_2} = await makeTwoUsers();
        await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Like"
        });
        const after = await handler.user.getUserByID(user_2.id);
        expect(after?.elo).toBeGreaterThan(user_2.elo);
    })

    it("should decrease elo when user receives dislike", async () => {
        const {user, user_2} = await makeTwoUsers();
        await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Dislike"
        });
        const after = await handler.user.getUserByID(user_2.id);
        expect(after?.elo).toBeLessThan(user_2.elo);
    })

    it("should increase elo when user receives message", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        await handler.sendMessage({
            message: "",
            recepientID: user_2.id,
            userID: user.id
        });
        const after = await handler.user.getUserByID(user_2.id);
        expect(after?.elo).toBeGreaterThan(user_2.elo);
    })

    it("should update subscription when user pays", async () => {
        const subscriptionID = "id";
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.processSubscriptionPay({
            userID: user.id,
            subscriptionID: subscriptionID
        });
        const after = output.data as User;

        expect(after?.subscriptionID).toEqual(subscriptionID);
        expect(after?.isSubscribed).toEqual(true);
    })

    it("should increase elo when user pays", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output = await handler.processSubscriptionPay({
            userID: user.id,
            subscriptionID: "id"
        });
        const after = output.data as User;
        expect(after?.elo).toBeGreaterThan(user.elo);
    })

    it("should decrease elo when user cancels", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const output0 = await handler.processSubscriptionPay({
            userID: user.id,
            subscriptionID: "id"
        });
        const before = output0.data as User;
        const output = await handler.cancelSubscription(user.id);
        const after = output.data as User;
        expect(after!.elo).toBeLessThan(before!.elo);
    })

    it("should not get swipe feed for nonuser", async () => {
        const output = await handler.getSwipeFeed("random");
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should get swipe feed, no swipes done", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();

        const output = await handler.getSwipeFeed(user.id);
        const feed = output.data;
        expect(feed?.profiles).toHaveLength(2);
        const profileIDs = feed?.profiles.map( val => val.id);
        expect(profileIDs?.includes(user4.id)).toEqual(true);
        expect(profileIDs?.includes(user3.id)).toEqual(true);
    })

    it("should get swipe feed with like", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();
        await handler.makeSwipe({
            userID: user3.id,
            action: "Like",
            swipedUserID: user.id
        });
        
        const output = await handler.getSwipeFeed(user.id);
        const feed = output.data;
        expect(feed?.likedMeIDs.includes(user3.id)).toEqual(true);
    })

    it("should not include like from nonGenderInterest in swipe feed", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();
        await handler.makeSwipe({
            userID: user2.id,
            action: "Like",
            swipedUserID: user.id
        });
        
        const output = await handler.getSwipeFeed(user.id);
        const feed = output.data;
        expect(feed?.profiles).toHaveLength(2);
        const profileIDs = feed?.profiles.map( val => val.id);
        expect(profileIDs?.includes(user2.id)).toEqual(false);
    })

    it("should not include already swiped user", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();
        await handler.makeSwipe({
            userID: user.id,
            action: "Like",
            swipedUserID: user4.id
        });
        const output = await handler.getSwipeFeed(user.id);
        const feed = output.data;
        expect(feed?.profiles).toHaveLength(1);
        const profileIDs = feed?.profiles.map( val => val.id);
        expect(profileIDs?.includes(user4.id)).toEqual(false);
    })

    it("should not include match in feed", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();

        await Promise.all([
            handler.makeSwipe({
                userID: user.id,
                action: "Like",
                swipedUserID: user4.id
            }),
            handler.makeSwipe({
                userID: user4.id,
                action: "Like",
                swipedUserID: user.id
            })
        ])

        const output = await handler.getSwipeFeed(user.id);
        const feed = output.data;
        expect(feed?.profiles).toHaveLength(1);
    })

    it("should include multiple genders in feed if interested", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();
        const output = await handler.getSwipeFeed(user4.id);
        const feed = output.data;
        expect(feed?.profiles).toHaveLength(3);
    })

    it("should not create verification code if email taken", async () => {
        const input = makeVerificationInput();
        input.schoolEmail = "b@berkeley.edu"
        await handler.verification.makeVerificationEntry(input);
        const output = await handler.getVerificationCode(input);
        expect(output.message).toEqual(errorText.emailInUse);
    })

    it("should not create verification for bad school email", async () => {
        const input = makeVerificationInput();
        input.schoolEmail = "bad";
        const output = await handler.getVerificationCode(input);
        expect(output.message).toEqual(errorText.invalidSchool);
    })

    it("should not create verification code if school email taken", async () => {
        const input = makeVerificationInput();
        const input2 = makeVerificationInput();
        input2.email = "other@gmail.com";

        await handler.verification.makeVerificationEntry(input);
        const output = await handler.getVerificationCode(input2);
        expect(output.message).toEqual(errorText.emailInUse);
    })

    it("should create verification code", async () => {
        const input = makeVerificationInput();
        expect(handler.mail.getVerificationCount()).toEqual(0);
        const output = await handler.getVerificationCode(input);
        expect(output.data).not.toEqual(null);
        expect(handler.mail.getVerificationCount()).toEqual(1);
    })

    it("should not verify user if wrong code", async () => {
        const input = makeVerificationInput();
        const code = await handler.verification.makeVerificationEntry(input);
        const output = await handler.verifyUserWithCode({
            code: code + 1,
            email: input.email,
            schoolEmail: input.schoolEmail
        });
        expect(output.message).toEqual(errorText.invalidVerificationCode);
    })

    it("should verify user if correct code", async () => {
        const input = makeVerificationInput();
        const code = await handler.verification.makeVerificationEntry(input);
        const output = await handler.verifyUserWithCode({
            code: code,
            email: input.email,
            schoolEmail: input.schoolEmail
        });
        expect(output.data).not.toEqual(null);
    })

    it("should not regenerate code if schoolEmail is not verifying", async () => {
        const output = await handler.regenerateVerificationCode("random");
        expect(output.message).toEqual(errorText.noVerification);
    })

    it("should regenerate verification code", async () => {
        const input = makeVerificationInput();
        await handler.verification.makeVerificationEntry(input);
        const output = await handler.regenerateVerificationCode(input.schoolEmail);
        expect(output.data).not.toEqual(null);
        expect(handler.mail.getVerificationCount()).toEqual(1);
    })

    it("should delete expired verifications when verifying", async () => {
        const input = makeVerificationInput();
        const input2 = makeVerificationInput();
        input2.schoolEmail = "b@berkeley.edu";
        const badInput = makeVerificationInput();
        badInput.schoolEmail = "bad";

        await Promise.all([
            handler.verification.makeVerificationEntry(input, addMinutes(new Date(), -2)),
            handler.verification.makeVerificationEntry(input2, addMinutes(new Date(), -10)),
        ]);
        expect(await handler.verification.getVerificationCount()).toEqual(2);
        await handler.getVerificationCode(badInput);
        expect(await handler.verification.getVerificationCount()).toEqual(0);
    })

    it("should not create user if not verified", async () => {
        const input = await validRequestUserInput();
        const output = await handler.createUser(input, false);
        expect(output.message).toEqual(errorText.userNotVerified);
        
        await handler.getVerificationCode({
            email: input.email,
            schoolEmail: "a@berkeley.edu"
        })
        const output1 = await handler.createUser(input, false);
        expect(output1.message).toEqual(errorText.userNotVerified);
    })

    it("should create user after verification", async () => {
        const input = await validRequestUserInput();
        const eduEmail = "a@berkeley.edu";
        const codeOutput = await handler.getVerificationCode({
            email: input.email,
            schoolEmail: eduEmail
        })

        await handler.verifyUserWithCode({
            code: codeOutput.data!,
            email: input.email,
            schoolEmail: eduEmail
        })

        const output = await handler.createUser(input, false);
        expect(output.data).not.toEqual(null);
    })

    it("should delete verification if user deleted", async () => {
        const input = await validRequestUserInput();
        const eduEmail = "a@berkeley.edu";
        const outputCode = await handler.getVerificationCode({
            email: input.email,
            schoolEmail: eduEmail
        })

        await handler.verifyUserWithCode({
            code: outputCode.data!,
            email: input.email,
            schoolEmail: eduEmail
        })

        const user = await handler.createUser(input, false);
        await handler.deleteUser(user!.data!.id);

        expect(await handler.verification.getVerificationBySchoolEmail(
            eduEmail
        )).toEqual(null);
    })

    it("should not login bad token", async () => {
        const output = await handler.loginWithToken({
            appleToken: "bad"
        });
        expect(output.message).toEqual(errorText.invalidLoginToken);
    })


    it("should create login entry if new", async () => {
        const email = "a";

        expect(await handler.login.getUserByEmail(email)).toEqual(null);
        const output = await handler.loginWithToken({appleToken: "a"}, email);
        expect(await handler.login.getUserByKey(output?.data?.key as string)).not.toEqual(null);
    })

    it("should update expo push token on login", async () => {
        const email = "a";
        const token = "token";

        await handler.loginWithToken({expoPushToken: token}, email);
        const login = await handler.login.getUserByEmail(email);
        expect(login?.expoPushToken).toEqual(token);
        
    })

    it("should update key if existing entry", async () => {
        const email = "a";

        const create = await handler.login.createUser({email});
        const after = await handler.loginWithToken({appleToken: "a"}, email);
        expect(create.key).not.toEqual(after.data?.key);
    })

    it("should not login with bad key", async () => {
        const output = await handler.autoLogin("bad");
        expect(output.message).toEqual(errorText.incorrectKey);
    })

    it("should not update key if auto login and existing", async () => {
        const email = "a";
        const create = await handler.login.createUser({email});
        const output = await handler.autoLogin(create.key);
        expect(output.data?.key).toEqual(create.key);
    })

    it("should not auto login with expired key", async () => {
        const email = "a";
        const create = await handler.login.createUser({
            email: email, 
            customDate: new Date(0)
        });
        const output = await handler.autoLogin(create.key);
        expect(output.message).toEqual(errorText.expiredKey);
    })

    it("should show correct login output after verification", async () => {
        const email = "a";
        const eduEmail = "b@lovedu.edu";
        await handler.loginWithToken({}, email);
        const outputCode = await handler.getVerificationCode({
            email: email,
            schoolEmail: eduEmail
        })
        await handler.verifyUserWithCode({
            code: outputCode.data!,
            email: email,
            schoolEmail: eduEmail
        })
        const output = await handler.loginWithToken({}, email);
        expect(output?.data?.newAccount).toEqual(true);
        expect(output?.data?.verified).toEqual(true);
    })

    it("should show correct login output after not verification", async () => {
        const email = "a";
        const output = await handler.loginWithToken({}, email);
        expect(output?.data?.newAccount).toEqual(true);
        expect(output?.data?.verified).toEqual(false);
    })

    it("should give onetimekey for socket on login and autologin", async () => {
        const email = "a";
        const output = await handler.loginWithToken({}, email);
        
        const user = await handler.login.getUserByEmail(email);
        expect(user?.userID).not.toEqual(null);
        expect(handler.socket.getUserIDFromKey(output.data?.socketToken!)).toEqual(user?.userID);

        const autoOutput = await handler.autoLogin(output.data?.key!);
        expect(handler.socket.getUserIDFromKey(autoOutput.data?.socketToken!)).toEqual(user?.userID);
    })

    it("should not give stats if not subscribed", async () => {
        const user = await handler.user.createUser(createUserInput());

        const output = await handler.getStatsIfSubscribed(user.id,{
            subscribed: false,
            endDate: new Date(),
            ID: "asd"
        });
        expect(output.message).toEqual(errorText.noSubscription);
    })

    it("should not give stats if expired", async () => {
        const user = await handler.user.createUser(createUserInput());

        const output = await handler.getStatsIfSubscribed(user.id,{
            subscribed: true,
            endDate: addWeeks(new Date(), -1),
            ID: "asd"
        });
        expect(output.message).toEqual(errorText.noSubscription);
    })

    it("should give stats if subscribed", async () => {
        const user = await handler.user.createUser(createUserInput());

        const output = await handler.getStatsIfSubscribed(user.id,{
            subscribed: true,
            endDate: addWeeks(new Date(), 1),
            ID: "asd"
        });
        expect(output.data).not.toEqual(null);
    })

    it("should give stats after unsubscribing until expiration", async () => {
        const user = await handler.user.createUser(createUserInput());

        await handler.processSubscriptionPay({
            userID: user.id,
            subscriptionID: "randomID"
        });
        await handler.cancelSubscription(user.id);

        expect(await handler.getStatsIfSubscribed(user.id)).not.toEqual(null);
    })

    it("should update read status update if not match", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));
        await handler.swipe.createSwipe({
            userID: user.id,
            action: "Like",
            swipedUserID: user2.id
        })

        const output = await handler.updateReadStatus({
            userID: user.id,
            toID: user2.id,
            timestamp: new Date() 
        });
        expect(output.data).not.toEqual(null);
    })

    it("should update read status", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        await Promise.all([
            handler.sendMessage({userID: user.id, recepientID: user_2.id, message: "1"}),
            handler.sendMessage({userID: user.id, recepientID: user_2.id, message: "2"}),
            handler.sendMessage({userID: user.id, recepientID: user_2.id, message: "3"}),
        ])

        const output = await handler.updateReadStatus({
            userID: user.id,
            toID: user_2.id,
            timestamp: addMinutes(new Date(),1)
        });
        expect(output.data).toEqual(0);

        const output1 = await handler.updateReadStatus({
            userID: user_2.id,
            toID: user.id,
            timestamp: addMinutes(new Date(),1)
        })
        expect(output1.data).toEqual(3);
    })

    it("should not login user with max reports", async () => {
        const login = await handler.loginWithToken({},sampleContent.email);
        await handler.verification.makeVerificationEntry({
            email: sampleContent.email,
            schoolEmail: sampleContent.eduEmail
        })
        await handler.verifyUserWithCode({
            code: sampleContent.code,
            email: sampleContent.email,
            schoolEmail: sampleContent.eduEmail
        })
        await Promise.all(Array.from({length: miscConstants.maxReportCount}, () => randomUUID()).map( (val) => 
            handler.report.makeReport({
                userID: val,
                reportedEmail: sampleContent.eduEmail
            })
        ));

        const output = await handler.loginWithToken({},sampleContent.email);
        expect(output?.data?.banned).toEqual(true);

        const autoOutput = await handler.autoLogin(login?.data?.key!);
        expect(autoOutput.message).toEqual(errorText.bannedFromPlatform);
    })

    it("should send message to recepient through socket", async () => {
        const { user, user_2 } = await makeTwoUsersAndMatch();
        const user2Socket = makeMockWebSocket();
        const message = "hi";

        handler.socket.addSocket({
            userID: user_2.id,
            socket: user2Socket
        })
        
        await handler.sendMessage({
            userID: user.id,
            recepientID: user_2.id,
            message: message
        });

        const received : Message = JSON.parse(user2Socket.payloads[0]).message;
        expect(received.message).toEqual(message);
    })

    it("should send match to recepient", async () => {
        const { user, user_2 } = await makeTwoUsers();
        const user2Socket = makeMockWebSocket();

        handler.socket.addSocket({
            userID: user_2.id,
            socket: user2Socket
        });

        await handler.makeSwipe({
            userID: user_2.id,
            swipedUserID: user.id,
            action: "Like"
        })
        expect(user2Socket.payloads).toHaveLength(0);

        await handler.makeSwipe({
            userID: user.id,
            swipedUserID: user_2.id,
            action: "Like"
        });
        expect(user2Socket.payloads).toHaveLength(1);
        const payload : NewMatchData = JSON.parse(user2Socket.payloads[0]).match;
        expect(payload.profile.id).toEqual(user.id);
    })

    it("should enable notifications on create user if push token", async () => {
        const requestUserInput = await validRequestUserInput();
        const token = "a";
        await handler.login.createUser({
            email: requestUserInput.email,
            expoPushToken: token
        })
        const user = await handler.createUser(requestUserInput,true);
        expect(user.data?.notifyOnMatch).toEqual(true);
        expect(user.data?.notifyOnMessage).toEqual(true);
    })

    it("should not enable notifications on create user if no token", async () => {
        const requestUserInput = await validRequestUserInput();
        await handler.login.createUser({
            email: requestUserInput.email,
        })
        const user = await handler.createUser(requestUserInput,true);
        expect(user.data?.notifyOnMatch).toEqual(false);
        expect(user.data?.notifyOnMessage).toEqual(false);
    })

    it("should not report if max per day is reached", async () => {
        const user = await handler.user.createUser(createUserInput());
        const random = await handler.user.createUser(createUserInput("random@berkeley.edu"));

        await Promise.all(Array.from({length: miscConstants.maxReportsPerDay}, () => randomUUID()).map(
            val => handler.report.makeReport({
                userID: user.id,
                reportedEmail: val
            })
        ))

        expect(await handler.report.getReportCount()).toEqual(miscConstants.maxReportsPerDay);

        const output = await handler.reportUser({
            userID: user.id,
            reportedID: random.id
        }, "eduEmail");
        expect(output.message).toEqual(errorText.tooManyReportsToday);
    })

    it("should not view announcement from nonuser", async () => {
        const announcement = await handler.announcement.makeAnnouncement(makeAnnouncementInput());

        const output = await handler.viewAnnouncement({
            announcementID: announcement.id,
            userID: "random"
        })
        expect(output.message).toEqual(errorText.notValidUser);
    })

    it("should not view nonannouncement from user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));

        const output = await handler.viewAnnouncement({
            announcementID: "random",
            userID: user.id
        })
        expect(output.message).toEqual(errorText.notValidAnnouncement);
    })

    it("should view announcement from user", async () => {
        const [user, announcement] = await Promise.all([
            handler.user.createUser(createUserInput("a@berkeley.edu")), 
            handler.announcement.makeAnnouncement(makeAnnouncementInput()),
        ]);

        const output = await handler.viewAnnouncement({
            announcementID: announcement.id,
            userID: user.id
        })
        expect(output.data).not.toEqual(null);
    })

    it("should get all current announcemnets", async () => {
        const [a1, a2] = await Promise.all([
            handler.announcement.makeAnnouncement(makeAnnouncementInput()),
            handler.announcement.makeAnnouncement(makeAnnouncementInput()),
        ])
        const output = await handler.getNewAnnouncements();
        expect(output.data).toHaveLength(2);
    })

    it("should get nonviewed announcements", async () => {
        const [a1, a2, user] = await Promise.all([
            handler.announcement.makeAnnouncement(makeAnnouncementInput()),
            handler.announcement.makeAnnouncement(makeAnnouncementInput()),
            handler.user.createUser(createUserInput("a@berkeley.edu")), 
        ])
        await handler.viewAnnouncement({
            announcementID: a1.id,
            userID: user.id
        })

        const output = await handler.getNewAnnouncements(user.id);
        expect(output.data).toHaveLength(1);
        expect(output.data![0].id).toEqual(a2.id)
    })
})