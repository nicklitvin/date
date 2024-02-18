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
}

export interface FileUpload {
    buffer: Buffer
    mimetype: string
}

export interface FileUploadAndURI extends FileUpload {
    uri: string
}

export interface MessageInput {
    userID: string
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
    university: string
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