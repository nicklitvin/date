import { Message } from "@prisma/client";
import { Expo } from "expo-server-sdk";
import { globals } from "../globals";
import { NewMatchData } from "../interfaces";

interface MessageNotificationInput {
    message: Message
    fromName: string
    recepientPushToken: string
}

interface MatchNotificationInput {
    match: NewMatchData
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
                    channelId: globals.notificationChannel,
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

    // public async newMatch(input : MatchNotificationInput) {
    //     try {
    //         return await this.client.sendPushNotificationsAsync([
    //             {
    //                 to: input.recepientPushToken,
    //                 channelId: globals.notificationChannel,
    //                 priority: "default",
    //                 title: globals.newMatchNotifTitle,
    //                 body: globals.newMatchMessage,
    //                 data: input.match,
    //             }
    //         ])
    //     } catch (err) {
    //         console.log(err);
    //         return null;
    //     }
    // }
}