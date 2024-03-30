import { Action } from "./types"

export type WithKey<T> = T & { key?: string }

export interface UserInput {
    email: string
    name: string 
    birthday: Date
    ageInterest: number[]
    gender: string | null
    genderInterest: string[]
    attributes: string[]
    description: string
    files: FileUpload[]
    alcohol: string
    smoking: string
}

export interface FileUpload {
    buffer: Buffer
    mimetype: string
}

export interface FileUploadAndURI extends FileUpload {
    uri: string
}

export interface MessageInput {
    recepientID: string
    message: string
}

export interface Message {
    id: string;
    timestamp: Date;
    userID: string;
    recepientID: string;
    message: string;
    readStatus: boolean;
}

export interface PublicProfile {
    id: string
    name: string
    age: number
    gender: string
    attributes: string[]
    images: string[]
    description: string
    alcohol: string
    smoking: string
}

export interface GetChatInput {
    withID: string
    fromTime: Date
}

export interface RequestReportInput {
    reportedID: string
}

export interface ChatPreview {
    profile: PublicProfile
    message: Message
}

export interface SwipeInput {
    swipedUserID: string
    action: Action
}

export interface NewMatchDataInput {
    timestamp: Date
}

export interface NewMatch {
    profile: PublicProfile
    timestamp: Date
}

export interface NewVerificationInput {
    personalEmail: string
    schoolEmail: string
}

export interface ConfirmVerificationInput {
    personalEmail: string
    schoolEmail: string
    code: number
}

export interface NewCodeInput {
    personalEmail: string
}

export interface DeleteImageInput {
    imageID: string
}

export interface UploadImageInput {
    image: FileUpload
}

export interface EditUserInput {
    setting: string
    value: any
}

export interface UserSwipeStats {
    allTime: SwipeBreakdown
    weekly: SwipeBreakdown[]
}

export interface SwipeBreakdown {
    myLikes: number
    myDislikes: number
    likedMe: number
    dislikedMe: number
}

export interface SubscriptionData {
    subscribed: boolean
    ID?: string
    endDate?: Date
}

export interface SettingData {
    title: string
    value: boolean
}

export interface UnlikeInput {
    withID: string
}

export interface GetProfileInput {
    userID: string
}

export interface SwipeFeed {
    profiles: PublicProfile[]
    likedMeIDs: string[]
}

export interface SwipeStatus {
    feedIndex : number
    lastSwipedIndex : number
}

export interface Preferences {
    genderPreference: string[]
    agePreference: [number, number]
}

export interface clientIDs {
    android?: string
    ios?: string
    expo?: string
}

export interface LoginInput {
    googleToken?: string
    appleToken?: string
    expoPushToken?: string
}

export interface LoginOutput {
    key: string
    newAccount: boolean
}

export interface EditPushTokenInput {
    token: string
}