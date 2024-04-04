import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { addYears, differenceInMonths } from "date-fns";
import { globals } from "../src/globals";
import { createUserInput, createUsersForSwipeFeed, validRequestUserInput } from "../__testUtils__/easySetup";
import { EloAction } from "../src/interfaces";

afterEach( async () => {
    await handler.user.deleteAllUsers();
})

describe("user", () => {
    const funcs = handler.user;

    it("should validate email", () => {
        expect(funcs.isSchoolEmailValid("a@gmail.com")).toEqual(false);
        expect(funcs.isSchoolEmailValid("a.edu@gmail.com")).toEqual(false);
        expect(funcs.isSchoolEmailValid("edu@gmail.com")).toEqual(false);
        expect(funcs.isSchoolEmailValid("a@edu.com")).toEqual(false);
        expect(funcs.isSchoolEmailValid("a@berkeley.edu")).toEqual(true);
    })

    it("should get university from email", () => {
        expect(funcs.getUniversityFromEmail("a@berkeley.edu")).toEqual("berkeley");
    })

    it("should create user", async () => {
        expect(await funcs.createUser(createUserInput())).not.toEqual(null);
    })

    it("should get user by ID", async () => {
        const user = await funcs.createUser(createUserInput()) ;
        expect(await funcs.getUserByID(user.id)).toEqual(user);
    })

    it("should get user by email", async () => {
        const user = await funcs.createUser(createUserInput()) ;
        expect(await funcs.getUserByEmail(user.email)).toEqual(user);
    })

    it("should not get public profile of nonuser", async () => {
        expect(await funcs.getPublicProfile("bad")).toEqual(null);
    })

    it("should get public profile of user", async () => {
        const user = await funcs.createUser(createUserInput()) ;
        const profile = await funcs.getPublicProfile(user.id);
        expect(profile).not.toEqual(null);
        expect(profile?.images[0].url).toEqual("url-imageURL");
        expect(profile?.images[0].id).toEqual(user.images[0]);
    })

    it("should not delete nonuser", async () => {
        expect(await funcs.deleteUser("bad")).toEqual(null);
    })

    it("should delete user", async () => {
        const user = await funcs.createUser(createUserInput()) ;
        expect(await funcs.deleteUser(user.id)).toEqual(user);
    })

    it("should delete all users", async () => {
        await Promise.all([
            funcs.createUser(createUserInput("a@berkeley.edu")),
            funcs.createUser(createUserInput("b@berkeley.edu")),
            funcs.createUser(createUserInput("c@berkeley.edu")),
        ])

        expect(await funcs.deleteAllUsers()).toEqual(3);
    })

    it("should not edit user with bad input", async () => {
        const user = await funcs.createUser(createUserInput());
        expect(await funcs.editUser({
            userID: user.id,
            setting: "genderInterest",
            value: 21
        })).toEqual(null);
    })

    it("should edit user", async () => {
        const user = await funcs.createUser(createUserInput());
        expect(await funcs.editUser({
            userID: user.id,
            setting: "genderInterest",
            value: ["Female"]
        })).not.toEqual(null);
    })

    it("should update user subscription after pay", async () => {
        const subscriptionID = "id";
        const user = await funcs.createUser(createUserInput());
        const after = await funcs.updateSubscriptionAfterPay(user.id,subscriptionID);
        
        expect(after.isSubscribed).toEqual(true);
        expect(after.subscriptionID).toEqual(subscriptionID);
        expect(differenceInMonths(after.subscribeEnd, user.subscribeEnd)).toEqual(1);
    })

    it("should cancel user subscription", async () => {
        const user = await funcs.createUser(createUserInput());
        await funcs.updateSubscriptionAfterPay(user.id);
        const after = await funcs.cancelSubscription(user.id);

        expect(after.isSubscribed).toEqual(false);
    })

    it("should validate input", async () => {
        expect(funcs.isInputValid(await validRequestUserInput())).toEqual(true);
    })

    it("should invalidate input", async () => {
        let input = await validRequestUserInput();
        input.birthday = addYears(new Date(), -(globals.minAge - 1)) 
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.birthday = addYears(new Date(), -(globals.maxAge + 1));
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.ageInterest = [];
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.ageInterest = [globals.minAge - 1,20];
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.name = "a".repeat(globals.maxNameLength + 1);
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.genderInterest = ["Male", "Female", "Female"];
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.attributes = Array(globals.maxAttributes + 1).fill("a");
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.description = "a".repeat(globals.maxDescriptionLength + 1);
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.files[0].mimetype = "bad"
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.files = Array(globals.minImagesCount - 1).fill(input.files[0]) ;
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.files = Array(globals.maxImagesCount + 1).fill(input.files[0]);
        expect(funcs.isInputValid(input)).toEqual(false);
    })

    it("should give more elo when liked by higher elo", async () => {
        const eloDiff = 10;
        const likedByHigherElo = funcs.getEloChange({
            action: EloAction.Like,
            eloDiff: eloDiff,
            userElo: globals.eloStart
        });
        const likedByLowerElo = funcs.getEloChange({
            action: EloAction.Like,
            eloDiff: -eloDiff,
            userElo: globals.eloStart
        });

        expect(likedByHigherElo).toBeGreaterThan(0);
        expect(likedByLowerElo).toBeGreaterThan(0);
        expect(likedByHigherElo).toBeGreaterThan(likedByLowerElo);
    })

    it("should lose more elo when disliked by lower elo", async () => {
        const eloDiff = 10;
        const dislikedByHigherElo = funcs.getEloChange({
            action: EloAction.Dislike,
            eloDiff: eloDiff,
            userElo: globals.eloStart
        });
        const dislikedByLowerElo = funcs.getEloChange({
            action: EloAction.Dislike,
            eloDiff: -eloDiff,
            userElo: globals.eloStart
        });

        expect(dislikedByHigherElo).toBeLessThan(0);
        expect(dislikedByLowerElo).toBeLessThan(0);
        expect(dislikedByLowerElo).toBeLessThan(dislikedByHigherElo);
    })

    it("should give more elo when messaged by higher elo", async () => {
        const eloDiff = 10;
        const messagedByHigherElo = funcs.getEloChange({
            action: EloAction.Like,
            eloDiff: eloDiff,
            userElo: globals.eloStart
        });
        const messagedByLowerElo = funcs.getEloChange({
            action: EloAction.Like,
            eloDiff: -eloDiff,
            userElo: globals.eloStart
        });

        expect(messagedByHigherElo).toBeGreaterThan(0);
        expect(messagedByLowerElo).toBeGreaterThan(0);
        expect(messagedByHigherElo).toBeGreaterThan(messagedByLowerElo);
    })

    it("should give more elo when higher elo logs on", async () => {
        const eloDiff = 10;
        const loginByHigherElo = funcs.getEloChange({
            action: EloAction.Login,
            userElo: globals.eloStart + eloDiff,
            eloDiff: eloDiff
        });
        const loginByLowerElo = funcs.getEloChange({
            action: EloAction.Login,
            userElo: globals.eloStart - eloDiff,
            eloDiff: -eloDiff
        });

        expect(loginByHigherElo).toBeGreaterThan(0);
        expect(loginByLowerElo).toBeGreaterThan(0);
        expect(loginByHigherElo).toBeGreaterThan(loginByLowerElo);
    })

    it("should give more elo when lower elo subscribes", async () => {
        const eloDiff = 10;
        const subscribeByHigherElo = funcs.getEloChange({
            action: EloAction.Subscribe,
            userElo: globals.eloStart + eloDiff,
            eloDiff: eloDiff
        });
        const subscribeByLowerElo = funcs.getEloChange({
            action: EloAction.Subscribe,
            userElo: globals.eloStart - eloDiff,
            eloDiff: -eloDiff
        });

        expect(subscribeByHigherElo).toBeGreaterThan(0);
        expect(subscribeByLowerElo).toBeGreaterThan(0);
        expect(subscribeByLowerElo).toBeGreaterThan(subscribeByHigherElo);
    })

    it("should remove more elo when higher elo unsubscribes", async () => {
        const eloDiff = 10;
        const unsubscribeByHigherElo = funcs.getEloChange({
            action: EloAction.Unsubscribe,
            userElo: globals.eloStart + eloDiff,
            eloDiff: eloDiff
        });
        const unsubscribeByLowerElo = funcs.getEloChange({
            action: EloAction.Unsubscribe,
            userElo: globals.eloStart - eloDiff,
            eloDiff: -eloDiff
        });

        expect(unsubscribeByHigherElo).toBeLessThan(0);
        expect(unsubscribeByLowerElo).toBeLessThan(0);
        expect(unsubscribeByHigherElo).toBeLessThan(unsubscribeByLowerElo);
    })

    it("should increase user elo rating", async () => {
        const eloDiff = 10;
        const user = await funcs.createUser(createUserInput());
        const after = await funcs.updateElo(user.id, eloDiff);
        expect(after?.elo).toEqual(user.elo + eloDiff);
    })

    it("should descrease user elo rating", async () => {
        const eloDiff = -10;
        const user = await funcs.createUser(createUserInput());
        const after = await funcs.updateElo(user.id, eloDiff);
        expect(after?.elo).toEqual(user.elo + eloDiff);
    })

    it("should get public profiles", async () => {
        const {user, user2, user3, user4} = await createUsersForSwipeFeed();

        const profiles = await funcs.getPublicProfilesFromCriteria({
            minDate: addYears(new Date(), -21),
            maxDate: addYears(new Date(), -20),
            gender: ["Male", "Female"]
        });
        expect(profiles).toHaveLength(2);
        expect(profiles[0].id).toEqual(user3.id);
        expect(profiles[1].id).toEqual(user2.id);

        const profiles2 = await funcs.getPublicProfilesFromCriteria({
            minDate: addYears(new Date(), -31),
            maxDate: addYears(new Date(), -24),
            gender: ["Female"]
        });
        expect(profiles2).toHaveLength(0);

        const profiles3 = await funcs.getPublicProfilesFromCriteria({
            minDate: addYears(new Date(), -31),
            maxDate: addYears(new Date(), -18),
            gender: ["Female","Male"],
            include: [user.id]
        });
        expect(profiles3).toHaveLength(1);
        expect(profiles3[0].id).toEqual(user.id);

        const profiles4 = await funcs.getPublicProfilesFromCriteria({
            minDate: addYears(new Date(), -31),
            maxDate: addYears(new Date(), -18),
            gender: ["Female","Male"],
            exclude: [user.id, user2.id, user4.id]
        });
        expect(profiles4).toHaveLength(1);
        expect(profiles4[0].id).toEqual(user3.id);
    })

    it("should get preferences", async () => {
        const input = createUserInput();
        await funcs.createUser(input);

        const output = await funcs.getPreferences(input.id);
        expect(output?.genderPreference).toHaveLength(input.genderInterest.length);
        expect(output?.agePreference[0]).toEqual(input.ageInterest[0]);
        expect(output?.agePreference[1]).toEqual(input.ageInterest[1]);
    })

    it("should get settings", async () => {
        const input = createUserInput();
        await funcs.createUser(input);

        const output = await funcs.getSettings(input.id);
        expect(output).toHaveLength(1);
        expect(output![0].title).toEqual(globals.notificationSetting);
    })

    it("should get subscription data", async () => {
        const input = createUserInput();
        await funcs.createUser(input);

        const output = await funcs.getSubscriptionData(input.id);
        expect(output?.ID).toEqual(undefined);
        expect(output?.subscribed).toEqual(false);
        expect(output?.endDate?.getTime()).toBeLessThanOrEqual(new Date().getTime())
    })
})

