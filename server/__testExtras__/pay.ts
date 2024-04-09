import { PaymentExtractOutput } from "../src/interfaces"
import { PaymentHandler } from "../src/abstracts";

export class MockPaymentHandler implements PaymentHandler {
    constructor() {}

    cancelSubscription(subscriptionID: string): Promise<boolean> {
        return Promise.resolve(true);
    }

    createSubscriptionSessionURL(userID: string, email: string, freeTrial: boolean) : 
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