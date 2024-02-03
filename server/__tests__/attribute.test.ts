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
        expect(attributes.get("Fitness")!.length).toEqual(2);
        expect(attributes.get("Fitness")![0].value).toEqual(attributeInput_2.value);
        expect(attributes.get("Fitness")![1].value).toEqual(attributeInput.value);
        expect(attributes.get("Music")!.length).toEqual(1);
        expect(attributes.get("Music")![0].value).toEqual(attributeInput_3.value);
    })

    it("should not delete nonattribute value", async () => {
        expect(await funcs.deleteAttribute("badID")).toEqual(null);
    })

    it("should delete attribute", async () => {
        await Promise.all([
            funcs.addAttribute(attributeInput),
            funcs.addAttribute(attributeInput_2),
        ])

        const attributes = await funcs.getAttributes();
        const attribute_id = attributes.get("Fitness")![0].id;
        expect(await funcs.deleteAttribute(attribute_id)).toEqual({
            ...attributeInput_2,
            id: attribute_id,
        });
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