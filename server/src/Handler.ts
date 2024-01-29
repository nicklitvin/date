import { Announcement, AttributeType, ErrorLog, Message, Opinion, User } from "@prisma/client";
import { PrismaManager } from "./PrismaManager";
import { FileUpload, MatchPreview, PublicProfile, SwipeFeed } from "./types";
import { doesUniversityMatchEmail } from "./utils";
import { maxProfileImageCount, reportsForBan } from "./globals";
import { deleteImage, uploadImage } from "./images";
import Stripe from "stripe";

export class Handler {
    private prisma : PrismaManager;
    private stripe : Stripe;

    constructor(prismaManager : PrismaManager) {
        this.prisma = prismaManager;
        this.stripe = new Stripe(process.env.STRIPE_API_KEY!, {
            typescript: true
        })
    }

    public async doesUserExist(userID : string) : Promise<boolean> {
        return Boolean(await this.prisma.getUser(userID));
    }
    
    public async createUser(user : User, images: FileUpload[] = [], maxImageCount : number = maxProfileImageCount) : Promise<boolean> {
        if (await this.prisma.getUser(user.id)) {
            return false;
        } else if (doesUniversityMatchEmail(user)) {
            await Promise.all(images.map( async (image, index) => {
                if (index < maxImageCount) {
                    try {
                        const imageID = await uploadImage(image.buffer, image.mimetype);
                        if (imageID) {
                            user.images.push(imageID);
                        }
                    } catch (err) {}
                } 
            }))

            return Boolean(await this.prisma.createUser(user));
        } else {
            return false;
        }
    }
    
    public async deleteUser(userID : string) : Promise<boolean> {
        const user = await this.prisma.getUser(userID);
        if (user) {
            const promises = user.images.map( async (imageID) => await deleteImage(imageID));
            await Promise.all(promises)

            return Boolean( (await this.prisma.deleteUser(userID))[0] )
        } else {
            return true;
        }
    }

    public async getProfile(userID : string) : Promise<User|null> {
        return await this.prisma.getUser(userID);
    }

    public async editUser(userID : string, setting: (keyof User), value : any) : Promise<boolean>{
        try {
            return Boolean(await this.prisma.editUser(userID, setting, value));
        } catch (err) {
            return false;
        }
    }

    public async getPublicProfile(userID : string) : Promise<PublicProfile|null> {
        return await this.prisma.getPublicProfile(userID);
    }

    public async getSwipeFeed(userID : string) : Promise<SwipeFeed> {
        if (await this.doesUserExist(userID)) {
            return this.prisma.getSwipeFeed(userID);
        } else {
            return {
                feed: [],
                likedMeIDs: []
            }
        }
    }

    public async makeSwipe(userID : string, swipedUserID : string, action : Opinion) : Promise<boolean> {
        if (await this.doesUserExist(userID) && await this.doesUserExist(swipedUserID) && userID != swipedUserID) {
            const swipe = await this.prisma.getSwipe(userID, swipedUserID);
            if (swipe) {
                return Boolean(await this.prisma.updateSwipe(swipe.id, action));
            } else {
                return Boolean(await this.prisma.createSwipe(userID, swipedUserID, action));
            }
        } else {
            return false;
        }
    }

    public async sendMessage(userID: string, recepientID : string, message : string) : Promise<boolean> {
        if (
            await this.doesUserExist(userID) &&
            await this.doesUserExist(recepientID) &&
            await this.prisma.doUsersLikeEachOther(userID, recepientID)  
        ) {
            return Boolean(await this.prisma.makeMessage(userID, recepientID, message));
        } else {
            return false;
        }
    }

    public async updateUserReadStatus(userID : string, fromID : string) : Promise<number> {
        if (await this.doesUserExist(userID)) {
            return (await this.prisma.updateUserReadStatus(userID, fromID)).count;
        } else {
            return 0;
        }
    }

    public async getMessages(userID : string, withID : string, count : number, fromTime: Date) : Promise<Message[]> {
        if (
            await this.doesUserExist(userID) &&
            await this.doesUserExist(withID) &&
            await this.prisma.doUsersLikeEachOther(userID, withID)
        ) {     
            return await this.prisma.getMessages(userID, withID, count, fromTime);
        } else {
            return []
        }
    }

    public async getChatPreviews(userID : string, timestamp : Date, count : number) : Promise<MatchPreview[]> {
        if (await this.doesUserExist(userID)) {
            return await this.prisma.getChatPreviews(userID, timestamp, count);
        } else {
            return []
        }
    }

    public async reportUser(userID : string, reportedID : string, customReportCountForBan : number = reportsForBan) : Promise<boolean> {
        if (
            await this.doesUserExist(userID) && 
            await this.doesUserExist(reportedID) &&
            !(await this.prisma.doesReportExist(userID, reportedID))
        ) {
            const report = await this.prisma.reportUser(userID, reportedID);
            if (report && await this.prisma.getReportCount(report.reportedEmail) >= customReportCountForBan) {
                await this.deleteUser(reportedID);
            } 
            return Boolean(report);
        } else {
            return false;
        }
    }

    public async getAttributes() : Promise<{ type: AttributeType; values: string[] }[]>{
        return await this.prisma.getAttributes()
    }

    public async createAttribute(type : AttributeType, title : string) : Promise<boolean> {
        return Boolean(await this.prisma.createAttribute(type,title));
    }

    public async deleteAttribute(type : AttributeType, title : string) : Promise<boolean> {
        return Boolean(await this.prisma.deleteAttribute(type, title));
    }

    public async uploadImage(userID : string, image : FileUpload, maxImageCount : number = maxProfileImageCount) : Promise<boolean> {
        const user = await this.getProfile(userID);
        if (user && user.images.length < maxImageCount) {
            const imageID = await uploadImage(image.buffer, image.mimetype);
            if (imageID) {
                return Boolean(await this.prisma.addImage(userID, imageID));
            }
            return false;
        }
        return false;
    }

    public async deleteImage(userID : string, imageID : string) : Promise<boolean> {
        const user = await this.prisma.getUser(userID);
        if (user) {
            if ( user.images.includes(imageID) ) {
                return Boolean(
                    await this.prisma.deleteImage(userID, imageID) &&
                    await deleteImage(imageID)
                );
            } else {
                return true;
            }
        }
        return false;   
    }

    public async changeImageOrder(userID : string, imageIDs : string[]) : Promise<boolean> {
        const user = await this.prisma.getUser(userID);
        if (
            user && 
            user.images.length == imageIDs.length && 
            imageIDs.every( (val) => user.images.includes(val))) 
        {
            return Boolean(await this.prisma.changeImageOrder(userID, imageIDs));
        }   
        return false;
    }

    public async logError(device : string, message : string, date : Date = new Date()) : Promise<boolean> {
        return Boolean(await this.prisma.logError(device, message, date));
    }

    public async getErrorLogs(count : number, fromTime : Date) : Promise<ErrorLog[]> {
        return await this.prisma.getErrorLogs(count,fromTime);
    } 

    public async clearErrorLogs() : Promise<boolean> {
        return Boolean(await this.prisma.clearErrorLogs());
    }

    public async makeAnnouncement(announcement : Announcement) : Promise<boolean> {
        return Boolean(await this.prisma.makeAnnouncement(announcement));
    }

    public async getAnnouncements() : Promise<Announcement[]> {
        return await this.prisma.getAnnouncements();
    }

    public async getAllAnnouncements() : Promise<Announcement[]> {
        return await this.prisma.getAllAnouncements();
    }

    public async deleteAnnouncement(id : string) : Promise<boolean> {
        const announcement = await this.prisma.getAnnouncementByID(id);
        if (announcement) {
            return Boolean(await this.prisma.deleteAnnouncement(id));
        }
        return true;
    }

    public async deleteAllAnouncement() : Promise<boolean> {
        return Boolean(await this.prisma.deleteAllAnouncements());
    }

    async createSubscriptioncSessionURL(userID : string) {
        const sessions = await this.stripe.checkout.sessions.create({
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
    
        return sessions;
    }

    async processSubscriptionPayment(userID: string, subscriptionID : string) : Promise<boolean> {
        const user = await this.prisma.getUser(userID);
        if (user) {
            const newDate = new Date();
            newDate.setMonth(newDate.getMonth() + 1);
            return Boolean(
                await this.prisma.setUserSubscriptionInfo(userID,newDate,subscriptionID,true)
            );
        }
        return false;
    }

    async cancelSubscription(userID : string, ignoreStripe = false) : Promise<boolean> {
        const user = await this.prisma.getUser(userID);
        if (user && user.subscriptionID) {
            return Boolean(
                (
                    ignoreStripe ?? 
                    await this.stripe.subscriptions.cancel(user.subscriptionID)
                ) && 
                await this.prisma.setUserSubscriptionInfo(
                    userID, user.subscribeEnd, user.subscriptionID, false
                )
            )
        }
        return false;
    }
}

