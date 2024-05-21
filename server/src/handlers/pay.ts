import Stripe from "stripe";
import { PaymentExtractOutput } from "../interfaces";
import { miscConstants } from "../globals";
import { PaymentHandler } from "../abstracts";
import { URLs } from "../urls";

export class StripePaymentHandler extends PaymentHandler {
    private stripe : Stripe;

    constructor() {
        super();
        this.stripe = new Stripe(process.env.STRIPE_API_KEY!, {
            typescript: true
        })
    }

    public async createSubscriptionSessionURL(userID : string, email : string, freeTrial: boolean) :
        Promise<string> 
    {
        const session = await this.stripe.checkout.sessions.create({
            customer_email: email,
            mode: "subscription",
            line_items: [
                {
                    price: process.env.PREMIUM_PRICE_ID!,
                    quantity: 1,
                }
            ],
            
            success_url: `http://${URLs.ip}:${URLs.port + 1}/success`,
            cancel_url: `http://${URLs.ip}:${URLs.port + 1}/premium?userID=${userID}`,
            allow_promotion_codes: true,
            metadata: {
                userID: userID
            },
            subscription_data: {
                trial_period_days: freeTrial ? miscConstants.freeTrialDays : 0
            }
        });
        return session.url as string;
    }

    public async extractDataFromPayment(signature : any, body : any) : 
        Promise<PaymentExtractOutput|null> 
    {
        try {
            const event = this.stripe.webhooks.constructEvent(body,signature, process.env.STRIPE_WEBHOOK!);
            if (event.type == "checkout.session.completed") {
                const session = event.data.object;
                return {
                    userID: session.metadata!["userID"],
                    subscriptionID: session.subscription!.toString()
                }
            }
            return null;
        } catch (err) {
            console.log(err);
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