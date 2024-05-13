import { Message } from "@prisma/client";
import { Expo } from "expo-server-sdk";
import { NewMatchData, ReadReceiptNotificationInput } from "../interfaces";
import { displayText, miscConstants } from "../globals";

interface MessageNotificationInput {
    fromName: string
    recepientPushToken: string,
    message: Message
}

export class NotificationHandler {
    private client : Expo;
    
    constructor() {
        this.client = new Expo({
            useFcmV1: true
        })
    }

    public async newMessage(input : MessageNotificationInput) {
        try {
            const receipts =  await this.client.sendPushNotificationsAsync([
                {
                    to: input.recepientPushToken,
                    channelId: miscConstants.notificationChannel,
                    priority: "default",
                    title: input.fromName,
                    body: input.message.message,
                }
            ])
            return receipts;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async newMatch(pushToken : string) {
        try {
            const receipts = await this.client.sendPushNotificationsAsync([
                {
                    to: pushToken,
                    channelId: miscConstants.notificationChannel,
                    priority: "default",
                    title: displayText.newMatchNotificationTitle,
                    body: displayText.newMatchNotificationMessage,
                }
            ])
            return receipts;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}