import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { UserInput } from "../src/types";
import { differenceInMonths } from "date-fns";

afterEach( async () => {
    await handler.user.deleteAllUsers();
})

describe("user", () => {
    const funcs = handler.user;

    const createUserInput = (email = "a@berkeley.edu") : UserInput => {
        return {
            email: email,
            name: "a",
            age: 21,
            gender: "Male",
            interestedIn: ["Male"],
            attributes: ["Basketball"],
            images: ["imageURL"],
            description: "description"
        }
    }

    it("should validate email", () => {
        expect(funcs.isEmailValid("a@gmail.com")).toEqual(false);
        expect(funcs.isEmailValid("a.edu@gmail.com")).toEqual(false);
        expect(funcs.isEmailValid("edu@gmail.com")).toEqual(false);
        expect(funcs.isEmailValid("a@edu.com")).toEqual(false);
        expect(funcs.isEmailValid("a@berkeley.edu")).toEqual(true);
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
        expect(await funcs.getPublicProfile(user.id)).not.toEqual(null);
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
            setting: "age",
            value: "21"
        })).toEqual(null);
    })

    it("should edit user", async () => {
        const user = await funcs.createUser(createUserInput());
        expect(await funcs.editUser({
            userID: user.id,
            setting: "age",
            value: 21
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
})
