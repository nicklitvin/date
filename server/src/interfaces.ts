import { AttributeType, Gender, Message, Opinion, Swipe, Usage, User } from "@prisma/client"

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
    id: string
    email: string   
    name: string
    birthday: Date
    ageInterest: number[]
    gender: Gender
    genderInterest: Gender[]
    attributes: string[]
    description: string
    alcohol: Usage
    smoking: Usage
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
    alcohol: Usage
    smoking: Usage
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
    message: Message
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

export interface SubscribeInput {
    userID: string
    subscriptionID: string
}

export interface PaymentExtractOutput {
    userID: string
    subscriptionID: string
}

export interface PaymentHandler {
    createSubscriptionSessionURL(userID : string, freeTrial: boolean) : 
        Promise<string>
    extractDataFromPayment(signature : string, body : any) : Promise<PaymentExtractOutput|null> 
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

export interface NewMatchInput {
    userID: string
    fromTime: Date
}

export interface EloUpdateInput {
    userElo: number,
    action: EloAction,
    /** Positive => higher elo than user, Negative => lower elo */
    eloDiff: number
}

export enum EloAction {
    Like,
    Dislike,
    Message,
    Subscribe,
    Unsubscribe,
    Login
}

export interface SwipeFeed {
    profiles: PublicProfile[]
    likedMeIDs: string[]
}

export interface GetProfileListInput {
    minDate: Date,
    maxDate: Date,
    gender: Gender[]

    include?: string[]
    exclude?: string[]
    count?: number
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

export interface MatchDataOutput {
    userID: string
    timestamp: Date
}

export interface NewMatchData {
    profile: PublicProfile
    timestamp: Date
}

export interface SubscriptionData {
    subscribed: boolean
    ID?: string
    endDate?: Date
}

export interface LoginInput {
    googleToken?: string
    appleToken?: string
    expoPushToken?: string
}

export interface LoginEntryInput {
    email: string
    expoPushToken?: string
    customDate?: Date
}

export interface LoginOutput {
    key: string
    newAccount: boolean
}

export interface Email {
    email : string
}

export type APIRequest<T> = Omit<T,"userID"|"id"> & {key : string};

export interface GetProfileInput {
    userID: string
}

export interface UpdatePushTokenInput {
    userID: string
    expoPushToken: string
}

export interface Preferences {
    genderPreference: string[]
    agePreference: [number, number]
}

export interface SettingData {
    title: string
    value: boolean
}