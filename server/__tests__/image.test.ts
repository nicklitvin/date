import { afterEach, describe, expect, it } from "@jest/globals";
import { handler, isAWSMocked } from "../jest.setup";
import { ImageInput } from "../src/interfaces";
import fs from "fs/promises";
import mime from "mime-types";
import axios from "axios";
import sizeOf from "image-size";

afterEach( async () => {
    await handler.image.deleteAllImages();
})

const imageFilePath = "./__tests__/images/goodImage.jpg";
const badImageFilePath = "./__tests__/images/badImage.txt";
export const getImageDetails = async (good : boolean) : Promise<ImageInput> => {
    return {
        buffer: await fs.readFile(good ? imageFilePath : badImageFilePath),
        mimetype: mime.lookup(good ? imageFilePath : badImageFilePath) as string
    }
}

describe("image", () => {
    const funcs = handler.image;
    
    const getImageDetails = async (good : boolean) : Promise<ImageInput> => {
        return {
            buffer: await fs.readFile(good ? imageFilePath : badImageFilePath),
            mimetype: mime.lookup(good ? imageFilePath : badImageFilePath) as string
        }
    }

    it("should upload image", async () => {
        expect(await funcs.uploadImage(await getImageDetails(true))).not.toEqual(null);
    })

    it("should not get nonImageURL", async () => {
        expect(await funcs.uploadImage(await getImageDetails(true))).not.toEqual(null);
    })

    it("should get imageURL", async () => {
        const imageID = await funcs.uploadImage(await getImageDetails(true)) as string;
        expect(await funcs.getImageURL(imageID)).not.toEqual(null);
    })
    
    it("should resize image upload", async () => {
        if (!isAWSMocked) {
            const imageID = await funcs.uploadImage(await getImageDetails(true)) as string;
            const URL = await funcs.getImageURL(imageID) as string;
            const response = await axios.get(URL, { responseType: "arraybuffer"} );
            const dimensions = sizeOf(response.data);
            
            expect(dimensions.height).toEqual(400);
            expect(dimensions.width).toEqual(300);
        }
    })

    it("should get all imageIDs", async () => {
        const image = await getImageDetails(true);
        await Promise.all([
            funcs.uploadImage(image),
            funcs.uploadImage(image),
            funcs.uploadImage(image)
        ]);

        const images = await funcs.getAllImageIDs();
        expect(images.length).toEqual(3);
    })

    it("should not delete nonimage", async () => {
        expect(await funcs.deleteImage("bad")).toEqual(null);
    })

    it("should delete image", async () => {
        const imageID = await funcs.uploadImage(await getImageDetails(true)) as string;
        expect(await funcs.deleteImage(imageID)).toEqual(imageID);
    })

    it("should delete all images", async () => {
        const image = await getImageDetails(true);
        await Promise.all([
            funcs.uploadImage(image),
            funcs.uploadImage(image),
            funcs.uploadImage(image)
        ]);

        const deleted = await funcs.deleteAllImages();
        expect(deleted).toEqual(3);
    })
})