import { describe, expect, it } from "@jest/globals";
import { deleteImage, getImage, uploadImage } from "../src/images";
import fs from "fs/promises";
import mime  from "mime-types";

describe("image", () => {
    const imageFilePath = "./testModules/image.jpg";

    it("should upload/get/delete image", async () => {
        const imageBuffer = await fs.readFile(imageFilePath);
        const imageType = mime.lookup(imageFilePath) as string;
        
        const imageID = await uploadImage(imageBuffer,imageType);
        expect(typeof(imageID)=="string").toEqual(true);

        const dowloadLink = await getImage(imageID as string);
        expect(typeof(dowloadLink)=="string").toEqual(true);
        
        expect(await deleteImage(imageID as string)).toEqual(true);
    })
})