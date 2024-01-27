import { describe, expect, it } from "@jest/globals";
import { deleteImage, getImageURL, uploadImage } from "../src/images";
import fs from "fs/promises";
import mime  from "mime-types";
import axios from "axios";
import sizeOf from "image-size";
import { imageHeight, imageWidth } from "../src/globals";

describe("image", () => {
    const imageFilePath = "./testModules/image.jpg";
    const badImageFilePath = "./testModules/badImage.txt";

    it("should upload/get/delete image", async () => {
        const imageBuffer = await fs.readFile(imageFilePath);
        const imageType = mime.lookup(imageFilePath) as string;
        
        const imageID = await uploadImage(imageBuffer,imageType);
        expect(typeof(imageID) == "string").toEqual(true);

        const dowloadLink = await getImageURL(imageID as string);
        expect(typeof(dowloadLink) == "string").toEqual(true);
        
        expect(await deleteImage(imageID as string)).toEqual(true);
    })

    it("should not upload bad file extension", async () => {
        const imageBuffer = await fs.readFile(badImageFilePath);
        const imageType = mime.lookup(badImageFilePath) as string;

        expect(await uploadImage(imageBuffer,imageType)).toEqual(null);
    })

    it("should upload and resize file", async () => {
        const imageBuffer = await fs.readFile(imageFilePath);
        const imageType = mime.lookup(imageFilePath) as string;

        const imageID = await uploadImage(imageBuffer,imageType) as string;
        expect(typeof(imageID)=="string").toEqual(true);

        const downloadLink = await getImageURL(imageID) as string;
        const response = await axios.get(downloadLink, { responseType: "arraybuffer"} );

        const dimensions = sizeOf(response.data);
        expect(dimensions.height).toEqual(imageHeight);
        expect(dimensions.width).toEqual(imageWidth);

        expect(await deleteImage(imageID)).toEqual(true);
    })

    it("should not delete if nonimage", async () => {
        const randomID = "random";
        expect(await deleteImage(randomID)).toEqual(true);
    })

    it("should not get download link for nonimage", async () => {
        const randomID = "random";
        expect(await getImageURL(randomID)).toEqual(null);
    })
})