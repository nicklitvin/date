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