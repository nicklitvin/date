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

interface BasicUserInput {
    email: string
    name: string
    age: number
    gender: Gender
    interestedIn: Gender[]
    attributes: string[]
    description: string
}

export interface UserInput extends BasicUserInput {
    images : string[]
}

export interface RequestUserInput extends BasicUserInput {
    files: FileUpload[]
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

export interface MessageInput {
    userID: string
    recepientID: string
    message: string
}

export interface ReadStatusInput {
    userID: string
    fromID: string
    timestamp: Date
}

export interface GetChatInput {
    userID: string
    withID: string
    count: number
    fromTime: Date
}

export interface UserReportInput {
    userID: string
    reportedEmail: string
}

export interface EditUserSubscriptionInput {
    userID: string
    subscribeEnd: Date
    isSubscribed: boolean
    subscriptionID: string | undefined
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

export type UserSwipeStats = {
    allTime: SwipeBreakdown
    weekly: SwipeBreakdown[]
}

export type SwipeBreakdown = {
    myLikes: number
    myDislikes: number
    likedMe: number
    dislikedMe: number
}

export type FileUpload = {
    buffer: Buffer
    mimetype: string
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
