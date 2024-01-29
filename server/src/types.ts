import { AttributeType, Gender, Message, User } from "@prisma/client"

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

export type MatchPreview = {
    profile: PublicProfile
    lastMessages: Message[]
}

export type FileUpload = {
    buffer: Buffer
    mimetype: string
}

export type UserStats = {
    allTime: LikeDislike
    weekly: LikeDislike[]
}

export type LikeDislike = {
    myLikes: number
    myDislikes: number
    likedMe: number
    dislikedMe: number
    weeksAgo: number | undefined
}