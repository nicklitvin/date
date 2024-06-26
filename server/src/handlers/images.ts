import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import sharp from "sharp";
import axios from "axios";
import { ImageUploadInput } from "../interfaces";
import { ImageHandler } from "../abstracts";

dotenv.config();
const bucket = process.env.BUCKET_NAME!;
const region = process.env.BUCKET_REGION!;
const accessKey = process.env.ACCESS_KEY!;
const secretAccessKey = process.env.SECRET_ACCESS_KEY!;

export class S3ImageHandler implements ImageHandler {
    private client : S3Client;
    private imageHeight = 400;
    private imageWidth = 300;

    constructor() {
        this.client = new S3Client({
            region: region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretAccessKey,
            }
        })
    }

    async uploadImage(input : ImageUploadInput) : Promise<string|null> {
        const resizedBuffer = await sharp(input.buffer).resize({
            width: this.imageWidth,
            height: this.imageHeight
        }).toBuffer();
    
        const imageID = `image-${randomUUID()}`;
    
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: imageID,
            Body: resizedBuffer,
            ContentType: input.mimetype
        })
    
        await this.client.send(command);
        return imageID;
    }

    async getImageURL(id : string) : Promise<string|null> {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: id,
        });
    
        const url = await getSignedUrl(this.client, command);
        try {
            await axios.get(url);
            return url;
        } catch (err) {
            return null;
        }
    }
    
    async deleteImage(id : string) : Promise<string|null> {
        if (await this.getImageURL(id)) {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: id,
            })
            await this.client.send(command);
            return id;
        } else {
            return null;
        }
    }
    
    async getAllImageIDs() : Promise<string[]>{
        let continuationToken : string|undefined = undefined;
        const result: string[] = [];
    
        while (true) {
            const command : ListObjectsV2Command = continuationToken ?
                new ListObjectsV2Command({
                    Bucket: bucket,
                    ContinuationToken: continuationToken
                }) :
                new ListObjectsV2Command({
                    Bucket: bucket
                })
    
            const data = await this.client.send(command);
            
            if (data && data.Contents) {
                const returnedIDs = data.Contents.map(val => val.Key as string)
                result.push(...returnedIDs);
                continuationToken = data.NextContinuationToken;
            }
            if (!continuationToken) break;
        }
    
        return result;
    }

    async deleteAllImages() : Promise<number> {
        const imageList = await this.getAllImageIDs();

        const deleted = await Promise.all(imageList.map(val => 
            this.deleteImage(val)
        ))

        return deleted.length;
    }
}