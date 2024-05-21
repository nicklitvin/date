import { ImageUploadInput, PaymentExtractOutput } from "./interfaces";

export abstract class MailHandler {
    protected count : number;

    constructor() {
        this.count = 0;
    }

    abstract sendVerificationCode(email : string, code : number) : Promise<any>
    
    clearVerificationCount() : number {
        const total = this.count;
        this.count = 0;
        return total;
    }
    getVerificationCount() : number {
        return this.count;
    }
}

export abstract class ImageHandler {
    abstract uploadImage(input : ImageUploadInput) : Promise<string|null>
    abstract getImageURL(id : string) : Promise<string|null>
    abstract deleteImage(id : string) : Promise<string|null>
    abstract getAllImageIDs() : Promise<string[]>
    abstract deleteAllImages() : Promise<number>
}

export abstract class PaymentHandler {
    abstract createSubscriptionSessionURL(userID : string, email : string, freeTrial: boolean) : Promise<string>
    abstract extractDataFromPayment(signature : any, body : any) : Promise<PaymentExtractOutput|null> 
    abstract cancelSubscription(subscriptionID: string) : Promise<boolean>
}