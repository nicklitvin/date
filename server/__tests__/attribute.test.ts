import { describe, expect, it } from "@jest/globals";
import { handler } from "../jest.setup";
import { userAttributes } from "../src/globals";
import { AttributeType } from "@prisma/client";

describe("attribute", () => {
    it("should set up attributes for testing", async () => {
        let count = 0;
        for (let type of Object.keys(userAttributes)) {
            count += userAttributes[type as AttributeType].length;
        }

        const retrievedAttributes = await handler.getAttributes();
        let actualCount = 0;

        for (let attribute of retrievedAttributes) {
            actualCount += attribute.values.length;            
        }
        expect(actualCount).toEqual(count);
    })  

    it("should create attribute", async () => {
        const createAttributeType = "Fitness";
        const newAttributeValue = "newValue"; 
        
        const beforeAttributes = await handler.getAttributes();
        const beforeList = beforeAttributes.find(obj => obj.type == createAttributeType);
        expect(beforeList?.values.includes(newAttributeValue)).toEqual(false);

        expect(await handler.createAttribute(createAttributeType, newAttributeValue)).toEqual(true);

        const afterAttributes = await handler.getAttributes();
        const afterList = afterAttributes.find(obj => obj.type == createAttributeType);
        expect(afterList?.values.includes(newAttributeValue)).toEqual(true);

        const copy = [...afterAttributes];
        copy.sort()
        expect(copy.every( (val,index) => val == afterAttributes[index])).toEqual(true);
    })

    it("should delete attribute", async () => {
        const removeType : AttributeType = "Fitness";
        const removeAttributeValue = "Basketball";

        const beforeAttributes = await handler.getAttributes();
        const beforeList = beforeAttributes.find(obj => obj.type == removeType);
        expect(beforeList?.values.includes(removeAttributeValue)).toEqual(true);

        expect(await handler.deleteAttribute(removeType, removeAttributeValue)).toEqual(true);

        const afterAttributes = await handler.getAttributes();
        const afterList = afterAttributes.find(obj => obj.type == removeType);
        expect(afterList?.values.includes(removeAttributeValue)).toEqual(false);
    })
})