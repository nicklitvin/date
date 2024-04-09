import { ImageUploadInput } from "../src/interfaces";
import { ImageHandler } from "../src/abstracts";

export class MockImageHandler extends ImageHandler {
    uploadedIDs : string [] = [];

    uploadImage(input : ImageUploadInput) : Promise<string|null> {
        const id = String(Math.random());
        this.uploadedIDs.push(id);
        return Promise.resolve(id);
    }

    getImageURL(id : string) : Promise<string|null> {
        return Promise.resolve(`url-${id}`)
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