import { PaymentExtractOutput, PaymentHandler } from "../src/interfaces"

export class MockPaymentHandler implements PaymentHandler {
    constructor() {}

    cancelSubscription(subscriptionID: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    createSubscriptionSessionURL(userID: string, freeTrial: boolean) : 
        Promise<string> 
    {
        return Promise.resolve("url")
    }

    extractDataFromPayment(signature: string, body: any): Promise<PaymentExtractOutput | null> {
        return Promise.resolve({
            userID: "userID",
            subscriptionID: "subscriptionID"
        })
    }
}