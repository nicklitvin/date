import { afterEach, describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { AttributeValueInput } from "../src/interfaces";

afterEach( async () => {
    await handler.attribute.deleteAllAttributes();
})

describe("attribute", () => {
    const funcs = handler.attribute;
    const attributeInput : AttributeValueInput = {
        type: "Fitness",
        value: "Gym"
    }
    const attributeInput_2 : AttributeValueInput = {
        type: "Fitness",
        value: "Basketball"
    }
    const attributeInput_3 : AttributeValueInput = {
        type: "Music",
        value: "Piano"
    }

    const fitness = "Fitness";
    const music = "Music";


    it("should add attribute value", async () => {
        expect(await funcs.addAttribute(attributeInput)).not.toEqual(null);
    })

    it("should get attributes", async () => {
        await Promise.all([
            funcs.addAttribute(attributeInput),
            funcs.addAttribute(attributeInput_2),
            funcs.addAttribute(attributeInput_3),
        ])

        const attributes = await funcs.getAttributes();
        expect(attributes[fitness]!.length).toEqual(2);
        expect(attributes[fitness]![0]).toEqual(attributeInput_2.value);
        expect(attributes[fitness]![1]).toEqual(attributeInput.value);
        expect(attributes[music]!.length).toEqual(1);
        expect(attributes[music]![0]).toEqual(attributeInput_3.value);
    })

    it("should not delete nonattribute value", async () => {
        expect(await funcs.deleteAttribute("badID")).toEqual(0);
    })

    it("should delete attribute", async () => {
        await Promise.all([
            funcs.addAttribute(attributeInput),
            funcs.addAttribute(attributeInput_2),
        ])

        expect(await funcs.deleteAttribute(attributeInput.value)).toEqual(1);
    })

    it("should delete all attributes", async () => {
        await Promise.all([
            funcs.addAttribute(attributeInput),
            funcs.addAttribute(attributeInput),
            funcs.addAttribute(attributeInput),
        ])
        expect(await funcs.deleteAllAttributes()).toEqual(3);
    })
})