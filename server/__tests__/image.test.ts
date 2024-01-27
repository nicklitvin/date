import { describe, expect, it } from "@jest/globals";
import { deleteImage, getImageList, getImageURL, uploadImage } from "../src/images";
import fs from "fs/promises";
import mime  from "mime-types";
import axios from "axios";
import sizeOf from "image-size";
import { imageHeight, imageWidth } from "../src/globals";
import { createSampleUser, defaults, handler } from "../jest.setup";
import { FileUpload } from "../src/types";
import { User } from "@prisma/client";

describe("image", () => {
    const imageFilePath = "./testModules/image.jpg";
    const badImageFilePath = "./testModules/badImage.txt";

    const getImageDetails = async (good : boolean = true) : Promise<FileUpload> => {
        return {
            buffer: await fs.readFile(good ? imageFilePath : badImageFilePath),
            mimetype: mime.lookup(good ? imageFilePath : badImageFilePath) as string
        }
    }

    it("should upload/get/delete image", async () => {
        const image = await getImageDetails()
        
        const imageID = await uploadImage(image.buffer,image.mimetype);
        expect(typeof(imageID) == "string").toEqual(true);

        const dowloadLink = await getImageURL(imageID as string);
        expect(typeof(dowloadLink) == "string").toEqual(true);
        
        expect(await deleteImage(imageID as string)).toEqual(true);
    })

    it("should not upload bad file extension", async () => {
        const image = await getImageDetails(false);
        expect(await uploadImage(image.buffer,image.mimetype)).toEqual(null);
    })

    it("should upload and resize file", async () => {
        const image = await getImageDetails()

        const imageID = await uploadImage(image.buffer,image.mimetype) as string;
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

    it("should create/delete user with images", async () => {
        const image = await getImageDetails();
        expect(await handler.createUser(
            createSampleUser(defaults.userID),[image, image]
        )).toEqual(true);
        
        const user = await handler.getProfile(defaults.userID);
        expect(user?.images.length).toEqual(2);
    })

    it("should ignore image with bad format", async () => {
        const image = await getImageDetails();
        const badImage = await getImageDetails(false);
        expect(await handler.createUser(
            createSampleUser(defaults.userID),[image, badImage]
        )).toEqual(true);
        
        const user = await handler.getProfile(defaults.userID);
        expect(user?.images.length).toEqual(1);
    })

    it("should not create user with too many images", async () => {
        const image = await getImageDetails();
        expect(await handler.createUser(
            createSampleUser(defaults.userID),
            [image, image, image],
            1
        )).toEqual(true);
        
        const user = await handler.getProfile(defaults.userID);
        expect(user?.images.length).toEqual(1);
    })

    it("should not upload for nonuser", async () => {
        const image = await getImageDetails();
        expect(await handler.uploadImage(defaults.userID, image)).toEqual(false);
    })

    it("should not upload bad image", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);

        const image = await getImageDetails(false);
        expect(await handler.uploadImage(defaults.userID, image)).toEqual(false);
    })

    it("should not upload past max image count", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);

        const image = await getImageDetails();
        expect(await handler.uploadImage(defaults.userID, image, 0)).toEqual(false);
    })

    it("should upload image for user", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);

        const image = await getImageDetails();
        expect(await handler.uploadImage(defaults.userID, image)).toEqual(true);
    })

    it("should not delete image for nonuser", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);

        const image = await getImageDetails();
        expect(await handler.uploadImage(defaults.userID, image)).toEqual(true);

        const user = await handler.getProfile(defaults.userID) as User;
        expect(await handler.deleteImage(defaults.userID_2, user.images[0])).toEqual(false);
    })

    it("should delete nonimage for user", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        
        const image = await getImageDetails();
        expect(await handler.uploadImage(defaults.userID, image)).toEqual(true);

        expect(await handler.deleteImage(defaults.userID, "random")).toEqual(true);
    })

    it("should delete image for user", async () => {
        expect(await handler.createUser(createSampleUser(defaults.userID))).toEqual(true);
        
        const image = await getImageDetails();
        expect(await handler.uploadImage(defaults.userID, image)).toEqual(true);

        const user = await handler.getProfile(defaults.userID) as User;
        const imageID = user.images[0];

        expect(await handler.deleteImage(defaults.userID, imageID)).toEqual(true);
        expect(await getImageURL(imageID)).toEqual(null);

        const userAfter = await handler.getProfile(defaults.userID) as User;
        expect(userAfter.images.length).toEqual(0);
    })

    it("should not change image order for nonuser", async () => {
        const image = await getImageDetails();
        expect(await handler.createUser(
            createSampleUser(defaults.userID),
            [image, image]
        )).toEqual(true);
        
        const user = await handler.getProfile(defaults.userID) as User;
        const userImages = user.images;
        userImages.reverse();

        expect(await handler.changeImageOrder(defaults.userID_2, userImages)).toEqual(false);
    })

    it("should not make invalid order for user", async () => {
        const image = await getImageDetails();
        expect(await handler.createUser(
            createSampleUser(defaults.userID),
            [image, image]
        )).toEqual(true);

        expect(await handler.changeImageOrder(defaults.userID, ["1","2"])).toEqual(false);
    })

    it("should change image order for user", async () => {
        const image = await getImageDetails();
        expect(await handler.createUser(
            createSampleUser(defaults.userID),
            [image, image]
        )).toEqual(true);

        const user = await handler.getProfile(defaults.userID) as User;
        const userImages = user.images;
        userImages.reverse();

        expect(await handler.changeImageOrder(defaults.userID, userImages)).toEqual(true);
    })

    it("should delete images with user", async () => {
        const image = await getImageDetails();
        expect(await handler.createUser(
            createSampleUser(defaults.userID),
            [image]
        )).toEqual(true);

        const user = await handler.getProfile(defaults.userID) as User;

        expect(await handler.deleteUser(defaults.userID)).toEqual(true);
        expect(await getImageURL(user.images[0])).toEqual(null);
    })

    it("ab", async () => {})
})