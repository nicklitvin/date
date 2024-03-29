import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { globals } from "../src/globals";
import { User } from "@prisma/client";
import { ChatPreview } from "../src/interfaces";
import { randomUUID } from "crypto";
import { createUserInput, createUsersForSwipeFeed, getImageDetails, makeMessageInputWithOneRandom, makeMessageInputWithRandoms, makeTwoUsers, makeTwoUsersAndMatch, makeVerificationInput, matchUsers, validRequestUserInput } from "../__testUtils__/easySetup";
import { addMinutes, addYears } from "date-fns";

afterEach( async () => {
    await handler.deleteEverything()
})

describe("handler", () => {
    it("should not create user with invalid input", async () => {
        const invalidInput = await validRequestUserInput();
        invalidInput.birthday = addYears(new Date(), -(globals.minAge - 1))

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
        expect(previews[0].message.id).toEqual(m3.id);
        expect(previews[1].profile.id).toEqual(user_2.id);
        expect(previews[1].message.id).toEqual(m2.id);
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

    it("should disliked swipe if report", async () => {
        const { user, user_2 } = await makeTwoUsers();
        await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id
        })
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
            setting: "birthday",
            value: new Date()
        })).toEqual(null);
    })

    it("should edit user", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        expect(await handler.editUser({
            userID: user.id,
            setting: "genderInterest",
            value: ["Female"]
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
        });

        expect(newMatches).toHaveLength(0);
    })

    it("should get new matches", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const user2 = await handler.user.createUser(createUserInput("b@berkeley.edu"));
        const user3 = await handler.user.createUser(createUserInput("c@berkeley.edu"));

        const match = await matchUsers(user.id, user2.id);
        const match2 = await matchUsers(user.id, user3.id);
        expect(match.getTime()).not.toEqual(match2.getTime());

        const newMatches = await handler.getNewMatches({
            userID: user.id,
            fromTime: new Date()
        });

        expect(newMatches).toHaveLength(2);
        expect(newMatches![0].profile.id).toEqual(user3.id);
        expect(newMatches![0].timestamp.getTime()).toEqual(match2.getTime());
        expect(newMatches![1].profile.id).toEqual(user2.id);
        expect(newMatches![1].timestamp.getTime()).toEqual(match.getTime());

        const newMatches1 = await handler.getNewMatches({
            userID: user.id,
            fromTime: new Date(match2.getTime() - 1)
        });
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
        const after = await handler.processSubscriptionPay({
            userID: user.id,
            subscriptionID: subscriptionID
        });

        expect(after?.subscriptionID).toEqual(subscriptionID);
        expect(after?.isSubscribed).toEqual(true);
    })

    it("should increase elo when user pays", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const after = await handler.processSubscriptionPay({
            userID: user.id,
            subscriptionID: "id"
        });
        expect(after?.elo).toBeGreaterThan(user.elo);
    })

    it("should decrease elo when user cancels", async () => {
        const user = await handler.user.createUser(createUserInput("a@berkeley.edu"));
        const before = await handler.processSubscriptionPay({
            userID: user.id,
            subscriptionID: "id"
        });
        const after = await handler.cancelSubscription(user.id);
        expect(after!.elo).toBeLessThan(before!.elo);
    })

    it("should not get swipe feed for nonuser", async () => {
        expect(await handler.getSwipeFeed("random")).toEqual(null);
    })

    it("should get swipe feed, no swipes done", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();

        const feed = await handler.getSwipeFeed(user.id);
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
        
        const feed = await handler.getSwipeFeed(user.id);
        expect(feed?.likedMeIDs.includes(user3.id)).toEqual(true);
    })

    it("should not include like from nonGenderInterest in swipe feed", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();
        await handler.makeSwipe({
            userID: user2.id,
            action: "Like",
            swipedUserID: user.id
        });
        
        const feed = await handler.getSwipeFeed(user.id);
        expect(feed?.profiles).toHaveLength(2);
        const profileIDs = feed?.profiles.map( val => val.id);
        expect(profileIDs?.includes(user2.id)).toEqual(false);
    })

    it("should not include already swiped user", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();
        await handler.makeSwipe({
            userID: user.id,
            action: "Like",
            swipedUserID: user3.id
        });
        const feed = await handler.getSwipeFeed(user.id);
        expect(feed?.profiles).toHaveLength(1);
        const profileIDs = feed?.profiles.map( val => val.id);
        expect(profileIDs?.includes(user3.id)).toEqual(false);
    })

    it("should include multiple genders in feed if interested", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();
        const feed = await handler.getSwipeFeed(user4.id);
        expect(feed?.profiles).toHaveLength(3);
    })

    it("should not create verification code if email taken", async () => {
        const input = makeVerificationInput();
        input.schoolEmail = "b@berkeley.edu"
        await handler.verification.makeVerificationEntry(input);
        expect(await handler.getVerificationCode(input)).toEqual(null);
    })

    it("should not create verification for bad school email", async () => {
        const input = makeVerificationInput();
        input.schoolEmail = "bad";
        expect(await handler.getVerificationCode(input)).toEqual(null);
    })

    it("should not create verification code if school email taken", async () => {
        const input = makeVerificationInput();
        const input2 = makeVerificationInput();
        input2.personalEmail = "other@gmail.com";

        await handler.verification.makeVerificationEntry(input);
        expect(await handler.getVerificationCode(input2)).toEqual(null);
    })

    it("should create verification code", async () => {
        const input = makeVerificationInput();
        expect(await handler.getVerificationCode(input)).not.toEqual(null);
    })

    it("should not verify user if wrong code", async () => {
        const input = makeVerificationInput();
        const code = await handler.verification.makeVerificationEntry(input);
        expect(await handler.verifyUserWithCode({
            code: code + 1,
            personalEmail: input.personalEmail,
            schoolEmail: input.schoolEmail
        })).toEqual(null);
    })

    it("should verify user if correct code", async () => {
        const input = makeVerificationInput();
        const code = await handler.verification.makeVerificationEntry(input);
        expect(await handler.verifyUserWithCode({
            code: code,
            personalEmail: input.personalEmail,
            schoolEmail: input.schoolEmail
        })).not.toEqual(null);
    })

    it("should not regenerate code if schoolEmail is not verifying", async () => {
        expect(await handler.regenerateVerificationCode("random")).toEqual(null);
    })

    it("should regenerate verification code", async () => {
        const input = makeVerificationInput();
        await handler.verification.makeVerificationEntry(input);
        expect(await handler.regenerateVerificationCode(input.schoolEmail)).not.toEqual(null);
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
        expect(await handler.createUser(input, false)).toEqual(null);
        
        await handler.getVerificationCode({
            personalEmail: input.email,
            schoolEmail: "a@berkeley.edu"
        })
        expect(await handler.createUser(input, false)).toEqual(null);
    })

    it("should create user after verification", async () => {
        const input = await validRequestUserInput();
        const eduEmail = "a@berkeley.edu";
        const code = await handler.getVerificationCode({
            personalEmail: input.email,
            schoolEmail: eduEmail
        })

        await handler.verifyUserWithCode({
            code: code!,
            personalEmail: input.email,
            schoolEmail: eduEmail
        })

        expect(await handler.createUser(input, false)).not.toEqual(null);
    })

    it("should delete verification if user deleted", async () => {
        const input = await validRequestUserInput();
        const eduEmail = "a@berkeley.edu";
        const code = await handler.getVerificationCode({
            personalEmail: input.email,
            schoolEmail: eduEmail
        })

        await handler.verifyUserWithCode({
            code: code!,
            personalEmail: input.email,
            schoolEmail: eduEmail
        })

        const user = await handler.createUser(input, false);
        await handler.deleteUser(user!.id);

        expect(await handler.verification.getVerificationBySchoolEmail(
            eduEmail
        )).toEqual(null);
    })

    it("should not login bad token", async () => {
        expect(await handler.loginWithToken({
            appleToken: "bad"
        })).toEqual(null);
    })


    it("should create login entry if new", async () => {
        const email = "a";

        expect(await handler.login.getUserByEmail(email)).toEqual(null);
        const loginKey = await handler.loginWithToken({appleToken: "a"}, email);
        expect(await handler.login.getUserByKey(loginKey as string)).not.toEqual(null);
    })

    it("should update key if existing entry", async () => {
        const email = "a";

        const create = await handler.login.createUser(email);
        const after = await handler.loginWithToken({appleToken: "a"}, email);
        expect(create.key).not.toEqual(after);
    })

    it("should not login with bad key", async () => {
        expect(await handler.autoLogin("bad")).toEqual(null);
    })

    it("should not update key if auto login and existing", async () => {
        const email = "a";
        const create = await handler.login.createUser(email);
        expect(await handler.autoLogin(create.key)).toEqual(create.key);
    })

    it("should not auto login with expired key", async () => {
        const email = "a";
        const create = await handler.login.createUser(email, new Date(0));
        expect(await handler.autoLogin(create.key)).toEqual(null);
    })
})