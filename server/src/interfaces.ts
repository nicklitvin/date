import { AttributeType, Gender, Message, Opinion, Swipe, Usage } from "@prisma/client"

// SERVER-ONLY

export interface HandlerUserInput extends UserInputWithFiles {
    email: string
    userID: string
}

export interface UserInput extends BasicUserInput {
    images : string[]
    email: string
    id: string
}

export interface JustEmail {
    email: string
}

export interface UserReportInput {
    userID: string
    reportedEmail: string
}

export interface EloUpdateInput {
    userElo: number,
    action: EloAction,
    /** Positive => higher elo than user, Negative => lower elo */
    eloDiff: number
}

export type APIRequest<T> = T & {key : string};

export enum EloAction {
    Like,
    Dislike,
    Message,
    Subscribe,
    Unsubscribe,
    Login
}

export interface PaymentExtractOutput {
    userID: string
    subscriptionID: string
}

export interface GetProfileListInput {
    minDate: Date,
    maxDate: Date,
    gender: Gender[]

    include?: string[]
    exclude?: string[]
    count?: number
}

export interface LoginEntryInput {
    email: string
    expoPushToken?: string
    customDate?: Date
    customID?: string
}

export interface SubscribeInput {
    userID: string
    subscriptionID: string
}

export interface UnlikeOutput {
    newSwipe: Swipe,
    deletedMessages: number
}

export interface WithEmail {
    email: string
}

// SHARED-WITH-CLIENT

export interface SocketPayloadToClient {
    message?: Message,
    match?: NewMatchData,
    readUpdate?: ReadStatusInput
    payloadProcessedID?: string,
    forceLogout?: boolean,
}

export interface SocketPayloadToServer {
    payloadID?: string
    message?: MessageInput
    readUpdate?: ReadStatusInput
}

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

export interface UserInputWithFiles extends BasicUserInput {
    files: ImageUploadWithString[]
}

export interface EditUserInput {
    userID: string
    setting: string
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
    toID: string
    timestamp: Date
}

export interface GetChatInput {
    userID: string
    withID: string
    fromTime: Date
}

export interface UserReportWithReportedID {
    userID: string
    reportedID: string
}

export interface ImageUploadInput {
    buffer: Buffer
    mimetype: string
}

export interface ViewableImage {
    url: string
    id: string
}   

export interface PublicProfile {
    id: string
    name: string
    age: number
    gender: Gender
    attributes: string[]
    images: ViewableImage[]
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

export interface ImageUploadWithString {
    content: string
    mimetype: string
}

export interface GetMatchesInput {
    userID: string
    timestamp: Date
}

export interface ChatPreview {
    profile: PublicProfile
    message: Message
}

export interface UploadImageInput {
    userID: string
    image: ImageUploadWithString
}

export interface DeleteImageInput {
    userID: string
    imageID: string
}

export interface UnlikeInput {
    userID: string
    withID: string
}

export interface SwipeFeed {
    profiles: PublicProfile[]
    likedMeIDs: string[]
}

export interface NewVerificationInput {
    schoolEmail: string
}

export interface ConfirmVerificationInput {
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

export interface LoginOutput {
    key?: string
    newAccount?: boolean
    verified?: boolean
    banned?: boolean,
    socketToken?: string
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
    display: string
    title: string
    value: boolean
}

export interface ClientIDs {
    android?: string
    ios?: string
    expo?: string
}

export interface APIOutput<T> {
    data?: T
    message?: string
}

export interface ReadReceiptNotificationInput {
    toPushToken: string
    fromUserID: string
    date: Date
}

export interface GetReadStatusInput {
    userID: string
    readerID: string
}

export interface JustUserID {
    userID: string
}

export interface ViewAnnouncementInput {
    userID: string,
    announcementID: string
}
