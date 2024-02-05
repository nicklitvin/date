import { ImageHandler, ImageInput } from "../src/interfaces";
import { randomUUID } from "crypto";

export class MockImageHandler implements ImageHandler {
    uploadedIDs : string [] = [];

    uploadImage(input : ImageInput) : Promise<string|null> {
        const id = String(randomUUID());
        this.uploadedIDs.push(id);
        return Promise.resolve(id);
    }

    getImageURL(id : string) : Promise<string|null> {
        console.log("A");
        return Promise.resolve(`mock image url for ${id}`)
    }

    deleteImage(id : string) : Promise<string|null> {
        const index = this.uploadedIDs.findIndex( (uploadID) => uploadID == id);
        if (index < 0) return Promise.resolve(null);
        else {
            this.uploadedIDs.splice(index, 1);
            return Promise.resolve(id);
        }
    }

    getAllImageIDs() : Promise<string[]> {
        return Promise.resolve(this.uploadedIDs);
    }

    deleteAllImages() : Promise<number> {
        const length = this.uploadedIDs.length;
        this.uploadedIDs.splice(0, length);
        return Promise.resolve(length);
    }
}