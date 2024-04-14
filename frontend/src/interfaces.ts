// APP-ONLY

export type WithKey<T> = T & { key?: string }

export interface ImageWithURI {
    image: {
        content: string
        mimetype: string
    }
    uri: string
}

export interface SwipeStatus {
    feedIndex : number
    lastSwipedIndex : number
}

export interface Attributes {
    [type : string] : string[]
}

// SCHEMA-TYPES

export interface Message {
    id: string
    timestamp: Date
    userID: string
    recepientID: string
    message: string
    readStatus: boolean
}

export enum Opinion {
    Like,
    Dislike
}

// SERVER-COPIES

export interface AnnouncementInput {
    startTime: Date
    endTime: Date
    title: string
    message: string
}

export interface AttributeValueInput {
    type: string
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
    gender: string
    genderInterest: string[]
    attributes: string[]
    description: string
    alcohol: string
    smoking: string
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
    gender: string
    attributes: string[]
    images: ViewableImage[]
    description: string
    alcohol: string
    smoking: string
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
    banned?: boolean
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

export interface APIOutput {
    data?: any
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

// export interface UserInput {
//     name: string 
//     birthday: Date
//     ageInterest: number[]
//     gender: string | null
//     genderInterest: string[]
//     attributes: string[]
//     description: string
//     files: ImageUploadWithString[]
//     alcohol: string
//     smoking: string
// }

// export interface MessageInput {
//     recepientID: string
//     message: string
// }

// export interface Message {
//     id: string;
//     timestamp: Date;
//     userID: string;
//     recepientID: string;
//     message: string;
//     readStatus: boolean;
// }

// export interface ViewableImage {
//     url: string
//     id: string
// } 

// export interface ImageUploadWithString {
//     content: string
//     mimetype: string
// }

// export interface UploadImageInput {
//     image: ImageUploadWithString
// }

// export interface PublicProfile {
//     id: string
//     name: string
//     age: number
//     gender: string
//     attributes: string[]
//     images: ViewableImage[]
//     description: string
//     alcohol: string
//     smoking: string
// }

// export interface GetChatInput {
//     withID: string
//     fromTime: Date
// }

// export interface UserReportWithReportedID {
//     reportedID: string
// }

// export interface ChatPreview {
//     profile: PublicProfile
//     message: Message
// }

// export interface SwipeInput {
//     swipedUserID: string
//     action: Action
// }

// export interface NewMatchDataInput {
//     timestamp: Date
// }

// export interface NewMatch {
//     profile: PublicProfile
//     timestamp: Date
// }

// export interface NewVerificationInput {
//     schoolEmail: string
// }

// export interface ConfirmVerificationInput {
//     schoolEmail: string
//     code: number
// }

// export interface DeleteImageInput {
//     imageID: string
// }

// export interface EditUserInput {
//     setting: string
//     value: any
// }

// export interface UserSwipeStats {
//     allTime: SwipeBreakdown
//     weekly: SwipeBreakdown[]
// }

// export interface SwipeBreakdown {
//     myLikes: number
//     myDislikes: number
//     likedMe: number
//     dislikedMe: number
// }

// export interface SubscriptionData {
//     subscribed: boolean
//     ID?: string
//     endDate?: Date
// }

// export interface SettingData {
//     display: string
//     title: string
//     value: boolean
// }

// export interface UnlikeInput {
//     withID: string
// }

// export interface GetProfileInput {
//     userID: string
// }

// export interface SwipeFeed {
//     profiles: PublicProfile[]
//     likedMeIDs: string[]
// }

// export interface SwipeStatus {
//     feedIndex : number
//     lastSwipedIndex : number
// }

// export interface Preferences {
//     genderPreference: string[]
//     agePreference: [number, number]
// }

// export interface clientIDs {
//     android?: string
//     ios?: string
//     expo?: string
// }

// export interface LoginInput {
//     googleToken?: string
//     appleToken?: string
//     expoPushToken?: string
// }

// export interface LoginOutput {
//     key: string
//     newAccount: boolean
//     verified: boolean
// }

// export interface EditPushTokenInput {
//     token: string
// }

// export interface ReadStatusInput {
//     toID: string
//     timestamp: Date
// }

// export interface GetReadStatusInput {
//     readerID: string
// }