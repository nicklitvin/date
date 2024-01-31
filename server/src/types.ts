import { AttributeType, Gender, Message, Opinion, User } from "@prisma/client"

export interface AnnouncementInput {
    startTime: Date
    endTime: Date
    title: string
    message: string
}

export interface AttributeValueInput {
    type: AttributeType
    value: string
}

export interface ErrorLogInput {
    device: string
    message: string
}

export interface UserInput {
    email: string
    name: string
    age: number
    gender: Gender
    interestedIn: Gender[]
    attributes: string[]
    images: string[]
    description: string
}

export interface EditUserInput {
    userID: string
    setting: (keyof User)
    value: any
}

export interface SwipeInput {
    userID: string
    swipedUserID: string
    action: Opinion
}

export const AllowedUserEdits: (keyof User)[] = ["age"]

export type ImageInput = {
    buffer: Buffer
    mimetype: string
}

export type PublicProfile = {
    id: string
    name: string
    age: number
    gender: Gender
    attributes: string[]
    images: string[]
    description: string
    university: string
}

// OLD

export type SwipeFeed = {
    feed: PublicProfile[]
    likedMeIDs: string[]
}

export type MatchPreview = {
    profile: PublicProfile
    lastMessages: Message[]
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

export type UserDelete = {
    user: number
    swipes: number
    messages: number
}