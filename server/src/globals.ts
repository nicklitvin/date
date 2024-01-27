import { AttributeType } from "@prisma/client";

export const matchPreviewMessageCount = 10;
export const reportsForBan = 10;
export const acceptableMimetypes = ["image/png","image/jpeg"];
export const imageHeight = 400;
export const imageWidth = 300;
export const maxProfileImageCount = 6;

export const userAttributes : {[type in AttributeType] : string[]} = {
    "Fitness": [
        "Basketball",
        "Soccer",
        "Football"
    ],
    "Music": [
        "Pop",
        "Hip-Hop",
        "R&B"
    ]
}