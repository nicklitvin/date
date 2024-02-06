import { AttributeType, Gender, Message, Opinion, Swipe, User } from "@prisma/client"

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
    fromTime: Date
}

export interface RequestReportInput {
    userID: string
    reportedID: string
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

export interface ImageInput {
    buffer: Buffer
    mimetype: string
}

export interface PublicProfile {
    id: string
    name: string
    age: number
    gender: Gender
    attributes: string[]
    images: string[]
    description: string
    university: string
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

export interface FileUpload {
    buffer: Buffer
    mimetype: string
}

export interface GetChatPreviewsInput {
    userID: string
    timestamp: Date
}

export interface ChatPreview {
    profile: PublicProfile
    messages: Message[]
}


export interface ImageHandler {
    uploadImage(input : ImageInput) : Promise<string|null>
    getImageURL(id : string) : Promise<string|null>
    deleteImage(id : string) : Promise<string|null>
    getAllImageIDs() : Promise<string[]>
    deleteAllImages() : Promise<number>
}

export interface UploadImageInput {
    userID: string
    image: FileUpload
}

export interface DeleteImageInput {
    userID: string
    imageID: string
}

export interface PaymentExtractOutput {
    userID: string
    subscriptionID: string
}

export interface PaymentHandler {
    createSubscriptionSessionURL(userID : string, freeTrial: boolean) : 
        Promise<string>
    extractDataFromPayment(request : Request) : Promise<PaymentExtractOutput|null> 
    cancelSubscription(subscriptionID: string) : Promise<boolean>
}

export interface UnlikeInput {
    userID: string
    withID: string
}

export interface UnlikeOutput {
    newSwipe: Swipe,
    deletedMessages: number
}

// OLD

// export type SwipeFeed = {
//     feed: PublicProfile[]
//     likedMeIDs: string[]
// }

// export type MatchPreview = {
//     profile: PublicProfile
//     lastMessages: Message[]
// }