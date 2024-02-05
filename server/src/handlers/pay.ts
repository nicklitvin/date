import Stripe from "stripe";
import { PaymentExtractOutput } from "../interfaces";

export class PaymentHandler {
    private stripe : Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_API_KEY!, {
            typescript: true
        })
    }

    public async createSubscriptioncSessionURL(userID : string) {
        return await this.stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [
                {
                    price: process.env.PREMIUM_PRICE_ID!,
                    quantity: 1
                }
            ],
            success_url: process.env.SUCCESS_RETURN_URL!,
            cancel_url: process.env.CANCEL_RETURN_URL!,
            allow_promotion_codes: true,
            metadata: {
                userID: userID
            }
        });
    }

    public async extractDataFromPayment(request : Request) : 
        Promise<PaymentExtractOutput|null> 
    {
        try {
            const body = await request.text();
            const signature = request.headers.get("Stripe-Signature") as string;
            const event = this.stripe.webhooks.constructEvent(body,signature,
                process.env.STRIPE_WEBHOOK!    
            );
    
            if (event.type == "checkout.session.completed") {
                const session = event.data.object;
                return {
                    userID: session.metadata!["userID"],
                    subscriptionID: session.subscription!.toString()
                }
            }
            return null;
        } catch (err) {
            return null;
        }
    }

    public async cancelSubscription(subscriptionID: string) : Promise<boolean> {
        try {
            await this.stripe.subscriptions.cancel(subscriptionID);
            return true;
        } catch (err) {
            return false
        }
    }
}