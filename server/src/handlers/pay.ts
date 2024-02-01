import Stripe from "stripe";

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

    public async extractUserIDFromPayment(request : Request) : Promise<string|null> {
        const body = await request.text();
        const signature = request.headers.get("Stripe-Signature") as string;
        const event = this.stripe.webhooks.constructEvent(body,signature,
            process.env.STRIPE_WEBHOOK!    
        );

        if (event.type == "checkout.session.completed") {
            const session = event.data.object;
            return session.metadata!["userID"];
        }
        return null;
    }
}