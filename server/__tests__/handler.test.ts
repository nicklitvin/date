import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { RequestUserInput } from "../src/types";
import { globals } from "../src/globals";
import fs from "fs/promises";

afterEach( async () => {
    await handler.deleteEverything()
})

describe("handler", () => {
    const imageFilePath = "./__tests__/images/goodImage.jpg";

    const validRequestUserInput = async () : Promise<RequestUserInput> => { 
        return {
            age: globals.minAge,
            attributes: Array.from({length: globals.maxAttributes}, (_,index) => `${index}`),
            interestedIn: ["Male", "Female"],
            email: "a@berkeley.edu",
            gender: "Male",
            files: [{
                buffer: await fs.readFile(imageFilePath),
                mimetype: "image/jpeg"
            }],
            name: "a".repeat(globals.maxNameLength),
            description: "a".repeat(globals.maxDescriptionLength)
        }
    }

    it("should not create user with invalid input", async () => {
        const invalidInput = await validRequestUserInput();
        invalidInput.age = globals.minAge - 1;

        expect(await handler.createUser(invalidInput)).toEqual(null);
    })

    it("should not create existing user", async () => {
        expect(await handler.createUser(await validRequestUserInput())).not.toEqual(null);
        expect(await handler.createUser(await validRequestUserInput())).toEqual(null);
    })
})