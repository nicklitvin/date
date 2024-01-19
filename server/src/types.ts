import { User } from "@prisma/client"

export const AllowedEdits : (keyof User)[] = ["age"]