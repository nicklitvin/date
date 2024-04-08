import { Message } from "@prisma/client";
import { Expo } from "expo-server-sdk";
import { NewMatchData, ReadReceiptNotificationInput } from "../interfaces";
import { miscConstants } from "../globals";

interface MessageNotificationInput {
    message: Message
    fromName: string
    recepientPushToken: string
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
            return await this.client.sendPushNotificationsAsync([
                {
                    to: input.recepientPushToken,
                    channelId: miscConstants.notificationChannel,
                    priority: "default",
                    title: input.fromName,
                    body: input.message.message,
                    data: input.message
                }
            ])
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // public async readReceipt(input : ReadReceiptNotificationInput) {
    //     try {
    //         return await this.client.sendPushNotificationsAsync([
    //             {
    //                 to: input.toPushToken,
    //                 channelId: miscConstants.notificationChannel,
    //                 priority: "normal",
    //             }
    //         ])
    //     } catch (err) {
    //         console.log(err);
    //         return null;
    //     }
    // }

    // public async newMatch(input : MatchNotificationInput) {
    //     try {
    //         return await this.client.sendPushNotificationsAsync([
    //             {
    //                 to: input.recepientPushToken,
    //                 channelId: globals.notificationChannel,
    //                 priority: "default",
    //                 title: globals.newMatchNotificationTItle,
    //                 body: globals.newMatchNotificationMessage,
    //                 data: input.match,
    //             }
    //         ])
    //     } catch (err) {
    //         console.log(err);
    //         return null;
    //     }
    // }
}