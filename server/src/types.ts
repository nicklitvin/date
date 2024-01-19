import { Gender, User } from "@prisma/client"

export const AllowedEdits : (keyof User)[] = ["age"]

export type PublicProfile = {
    id : string
    name : string
    age: number
    gender: Gender
    attributes: string[]
    images: string[]
    description: string
    university: string
}

export type SwipeFeed = {
    feed: PublicProfile[]
    likedMeIDs: string[]
}