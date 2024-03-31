import { User } from "@prisma/client";

export const allowedAttributeEdits : (keyof User)[] = ["genderInterest"];

export function isAdmin(key : string) {
    return process.env.ADMIN_KEY! == key;
}