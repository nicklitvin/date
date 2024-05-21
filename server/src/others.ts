import { AttributeType } from "@prisma/client";

export const allowedAttributeEdits : string[] = [
    "genderInterest", 
    "notifyOnMatch",
    "notifyOnMessage", 
    "description", 
    "ageInterest",
    "attributes",
    "alcohol",
    "smoking",
    "images"
];

export function isAdmin(key : string) {
    return process.env.ADMIN_API_KEY! == key;
}

export function isWebCheckoutKey(key : string) {
    return process.env.WEB_CHECKOUT_KEY! == key;
}

export const attributeList : Record<AttributeType, string[]>= {
    Fitness: ["Football", "Soccer", "Basketball", "Swim", "Running", "Volleyball"],
    Music: ["Pop", "Rap", "EDM", "KPop", "Country", "Jazz"]
}