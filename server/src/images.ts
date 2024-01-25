import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

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
    const imageID = randomUUID();

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: imageID,
        Body: buffer,
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

export async function getImage(id : string) : Promise<string|null> {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: id,
    });
    return await getSignedUrl(s3, command);
}

export async function deleteImage(id : string) : Promise<boolean> {
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: id
    })
    try {
        await s3.send(command);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
