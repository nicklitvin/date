import { AttributeType } from "@prisma/client";

export const matchPreviewMessageCount = 10;
export const reportsForBan = 10;

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