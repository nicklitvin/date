import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { globals } from "../src/globals";
import { createUserInput, validRequestUserInput } from "./user.test";
import { User } from "@prisma/client";
import { makeMessageInputWithOneRandom, makeMessageInputWithRandoms } from "./message.test";
import { ChatPreview } from "../src/interfaces";
import { randomUUID } from "crypto";
import { getImageDetails } from "./image.test";

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

    it("should report user", async () => {
        const {user, user_2} = await makeTwoUsersAndMatch();
        expect(await handler.reportUser({
            userID: user.id,
            reportedID: user_2.id
        })).not.toEqual(null);        
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
})