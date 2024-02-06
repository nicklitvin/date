import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { FileUpload, RequestUserInput, UserInput } from "../src/interfaces";
import { differenceInMonths } from "date-fns";
import { globals } from "../src/globals";
import fs from "fs/promises";

afterEach( async () => {
    await handler.user.deleteAllUsers();
})

const imageFilePath = "./__tests__/images/goodImage.jpg";

export const validRequestUserInput = async () : Promise<RequestUserInput> => { 
    const buffer = await fs.readFile(imageFilePath);
    return {
        age: globals.minAge,
        attributes: Array.from({length: globals.maxAttributes}, (_,index) => `${index}`),
        interestedIn: ["Male", "Female"],
        email: "a@berkeley.edu",
        gender: "Male",
        files: [
            {
                buffer: buffer,
                mimetype: "image/jpeg"
            },
            {
                buffer: buffer,
                mimetype: "image/jpeg"
            },
        ],
        name: "a".repeat(globals.maxNameLength),
        description: "a".repeat(globals.maxDescriptionLength)
    }
}

export const createUserInput = (email = "a@berkeley.edu") : UserInput => {
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

describe("user", () => {
    const funcs = handler.user;

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

    it("should validate input", async () => {
        expect(funcs.isInputValid(await validRequestUserInput())).toEqual(true);
    })

    it("should invalidate input", async () => {
        let input = await validRequestUserInput();
        input.age = globals.minAge - 1
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.age = globals.maxAge + 1
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.name = "a".repeat(globals.maxNameLength + 1);
        expect(funcs.isInputValid(input)).toEqual(false);

        input = await validRequestUserInput();
        input.interestedIn = ["Male", "Female", "Female"];
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
})
