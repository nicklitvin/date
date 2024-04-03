import { AttributeType, User } from "@prisma/client";

export const allowedAttributeEdits : string[] = [
    "genderInterest", 
    "notifications", 
    "description", 
    "ageInterest",
    "attributes",
    "alcohol",
    "smoking"
];

export function isAdmin(key : string) {
    return process.env.ADMIN_KEY! == key;
}

export const attributeList : Record<AttributeType, string[]>= {
    Fitness: ["Football", "Soccer", "Basketball", "Swim", "Running", "Volleyball"],
    Music: ["Pop", "Rap", "EDM", "KPop", "Country", "Jazz"]
}