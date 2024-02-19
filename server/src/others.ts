import { User } from "@prisma/client";

export const allowedAttributeEdits : (keyof User)[] = ["genderInterest"];