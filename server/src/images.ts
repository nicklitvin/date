import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { acceptableMimetypes, imageHeight, imageWidth } from "./globals";
import sharp from "sharp";
import axios from "axios";

dotenv.config();

const bucket = process.env.BUCKET_NAME!;
const region = process.env.BUCKET_REGION!;
const accessKey = process.env.ACCESS_KEY!;
const secretAccessKey = process.env.SECRET_ACCESS_KEY!;

const s3 = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    }
})

export async function uploadImage(buffer : Buffer, mimetype : string) : Promise<string|null> {
    if (!acceptableMimetypes.includes(mimetype.toLowerCase())) return null;

    const resizedBuffer = await sharp(buffer).resize({
        width: imageWidth,
        height: imageHeight
    }).toBuffer();

    const imageID = randomUUID();

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: imageID,
        Body: resizedBuffer,
        ContentType: mimetype
    })

    try {
        await s3.send(command);
        return imageID;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function getImageURL(id : string) : Promise<string|null> {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: id,
    });

    const url = await getSignedUrl(s3, command);
    try {
        await axios.get(url);
        return url;
    } catch (err) {
        return null;
    }
}

export async function deleteImage(id : string) : Promise<boolean> {
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: id,
    })
    try {
        await s3.send(command);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export async function getImageList() {
    const command = new ListObjectsV2Command({
        Bucket: bucket
    });

    return (await s3.send(command)).Contents;
}
