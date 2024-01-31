// import { Announcement, Attribute, AttributeType, ErrorLog, Message, Opinion, Swipe, User, UserReport } from "@prisma/client";
// import { PrismaManager } from "../../old/PrismaManager";
// import { AnnouncementInput, AttributeValueInput, FileUpload, MatchPreview, PublicProfile, SwipeFeed, UserDelete, UserStats } from "./types";
// import { doesUniversityMatchEmail } from "./utils";
// import { maxProfileImageCount, reportsForBan } from "./globals";
// import { deleteImage, uploadImage } from "./handlers/images";
// import Stripe from "stripe";
// import { startOfWeek, subWeeks } from "date-fns";
// import { randomUUID } from "crypto";

// export class Handler {
//     private prisma : PrismaManager;
//     private stripe : Stripe;

//     constructor(prismaManager : PrismaManager) {
//         this.prisma = prismaManager;
//         this.stripe = new Stripe(process.env.STRIPE_API_KEY!, {
//             typescript: true
//         })
//     }

//     // ANOUNCEMENT

//     public async makeAnnouncement(input : AnnouncementInput) : Promise<Announcement> {
//         return await this.prisma.makeAnnouncement({
//             ...input,
//             id: randomUUID()
//         });
//     }

//     public async getCurrentAnnouncements() : Promise<Announcement[]> {
//         return await this.prisma.getCurrentAnnouncements();
//     }

//     public async getAllAnnouncements() : Promise<Announcement[]> {
//         return await this.prisma.getAllAnouncements();
//     }

//     public async deleteAnnouncement(id : string) : Promise<Announcement|null> {
//         return await this.prisma.getAnnouncementByID(id) ?
//             await this.prisma.deleteAnnouncement(id) :
//             null;
//     }

//     public async deleteAllAnouncement() : Promise<number> {
//         return await this.prisma.deleteAllAnouncements();
//     }

//     // ATTRIBUTES

//     public async getAttributes() : Promise<Attribute[]> {
//         return await this.prisma.getAttributes()
//     }

//     public async addAttributeValue(input : AttributeValueInput) : Promise<Attribute> {
//         const attribute = await this.prisma.getAttribute(input.type) as Attribute;
        
//         // const attributeList = await this.getAttributes();

//         return await this.prisma.addAttributeValue(input);
//     }

//     public async deleteAttributeValue(type : AttributeType, value : string) : 
//         Promise<Attribute|null> 
//     {
//         return await this.prisma.deleteAttributeValue(type, value);
//     }

//     // OLD

//     public async doesUserExist(userID : string) : Promise<boolean> {
//         return Boolean(await this.prisma.getUser(userID));
//     }

//     public async deleteUser(userID : string) : Promise<UserDelete> {
//         const user = await this.prisma.getUser(userID);
//         if (user) {
//             const promises = user.images.map( async (imageID) => 
//                 await deleteImage(imageID)
//             );
//             await Promise.all(promises)
//             return await this.prisma.deleteUser(userID)
//         } else {
//             return {
//                 messages: 0,
//                 swipes: 0,
//                 user: 0
//             };
//         }
//     }
    
//     public async createUser(user : User, images: FileUpload[] = [], 
//         maxImageCount : number = maxProfileImageCount) : Promise<User|null> 
//     {
//         if (await this.prisma.getUser(user.id)) {
//             return null;
//         } else if (doesUniversityMatchEmail(user)) {
//             await Promise.all(images.map( async (image, index) => {
//                 if (index < maxImageCount) {
//                     try {
//                         const imageID = await uploadImage(image.buffer, image.mimetype);
//                         if (imageID) {
//                             user.images.push(imageID);
//                         }
//                     } catch (err) {}
//                 } 
//             }))

//             return await this.prisma.createUser(user);
//         } else {
//             return null;
//         }
//     }

//     public async getProfile(userID : string) : Promise<User|null> {
//         return await this.prisma.getUser(userID);
//     }

//     public async editUser(userID : string, setting: (keyof User), value : any) : 
//         Promise<User|null>
//     {
//         try {
//             return await this.prisma.editUser(userID, setting, value);
//         } catch (err) {
//             return null;
//         }
//     }

//     public async getPublicProfile(userID : string) : Promise<PublicProfile|null> {
//         return await this.prisma.getPublicProfile(userID);
//     }

//     public async getSwipeFeed(userID : string) : Promise<SwipeFeed|null> {
//         return await this.doesUserExist(userID) ? 
//             await this.prisma.getSwipeFeed(userID) : 
//             null;
//     }

//     public async makeSwipe(userID : string, swipedUserID : string, action : Opinion) : 
//         Promise<Swipe|null> 
//     {
//         const [userExists, swipedExists] = await Promise.all([
//             this.doesUserExist(userID),
//             this.doesUserExist(swipedUserID)
//         ]);
//         if (userExists && swipedExists && userID != swipedUserID) {
//             const swipe = await this.prisma.getSwipe(userID, swipedUserID);
//             if (swipe) {
//                 return await this.prisma.updateSwipe(swipe.id, action);
//             } else {
//                 return await this.prisma.createSwipe(userID, swipedUserID, action);
//             }
//         } else {
//             return null;
//         }
//     }

//     public async sendMessage(userID: string, recepientID : string, message : string) : 
//         Promise<Message|null> 
//     {
//         const [userExists, recepientExists, doLikeEachOther] = await Promise.all([
//             this.doesUserExist(userID),
//             this.doesUserExist(recepientID),
//             this.prisma.doUsersLikeEachOther(userID, recepientID)  
//         ])
//         if (userExists && recepientExists && doLikeEachOther) {
//             return await this.prisma.makeMessage(userID, recepientID, message);
//         } else {
//             return null;
//         }
//     }

//     public async updateUserReadStatus(userID : string, fromID : string) : 
//         Promise<number> 
//     {
//         return await this.doesUserExist(userID) ? 
//             this.prisma.updateUserReadStatus(userID, fromID) :
//             0;
//     }

//     public async getMessages(userID : string, withID : string, count : number, 
//         fromTime: Date) : Promise<Message[]|null> 
//     {
//         const [userExists, withExists, doLikeEachOther] = await Promise.all([
//             this.doesUserExist(userID),
//             this.doesUserExist(withID),
//             this.prisma.doUsersLikeEachOther(userID, withID)  
//         ])
//         if (userExists && withExists && doLikeEachOther) {
//             return await this.prisma.getMessages(userID, withID, count, fromTime);
//         } else {
//             return null
//         }
//     }

//     public async getChatPreviews(userID : string, timestamp : Date, count : number) : 
//         Promise<MatchPreview[]|null> 
//     {
//         return await this.doesUserExist(userID) ?
//             await this.prisma.getChatPreviews(userID, timestamp, count) :
//             null;
//     }

//     public async reportUser(userID : string, reportedID : string, 
//         customReportCountForBan : number = reportsForBan) : Promise<UserReport|null> 
//     {
//         const [userExists, reportedUserExists, reportExists] = await Promise.all([
//             this.doesUserExist(userID),
//             this.doesUserExist(reportedID),
//             this.prisma.doesReportExist(userID, reportedID)
//         ]);

//         if (userExists && reportedUserExists && !reportExists) {
//             const report = await this.prisma.reportUser(userID, reportedID);
//             if (report && await this.prisma.getReportCount(report.reportedEmail) >= 
//                 customReportCountForBan) 
//             {
//                 await this.deleteUser(reportedID);
//             } 
//             return report;
//         } else {
//             return null;
//         }
//     }

//     public async uploadImage(userID : string, image : FileUpload, 
//         maxImageCount : number = maxProfileImageCount) : Promise<User|null> 
//     {
//         const user = await this.getProfile(userID);
//         if (user && user.images.length < maxImageCount) {
//             const imageID = await uploadImage(image.buffer, image.mimetype);
//             return imageID ? 
//                 await this.prisma.addImage(userID, imageID) :
//                 null
//         }
//         return null;
//     }

//     public async deleteImage(userID : string, imageID : string) : Promise<User|null> {
//         const user = await this.prisma.getUser(userID);
//         if (user) {
//             if ( user.images.includes(imageID) ) {
//                 const [userAfterDelete, storageDelete] = await Promise.all([
//                     this.prisma.deleteImage(userID, imageID),
//                     deleteImage(imageID)
//                 ]);
//                 return userAfterDelete;
//             } else {
//                 return user;
//             }
//         }
//         return null;   
//     }

//     public async changeImageOrder(userID : string, imageIDs : string[]) : 
//         Promise<User|null> 
//     {
//         const user = await this.prisma.getUser(userID);
//         if (
//             user && 
//             user.images.length == imageIDs.length && 
//             imageIDs.every( (val) => user.images.includes(val))) 
//         {
//             return await this.prisma.changeImageOrder(userID, imageIDs);
//         }   
//         return null;
//     }

//     public async recordError(error : ErrorLog) : Promise<ErrorLog> {
//         return await this.prisma.recordError(error);
//     }

//     public async getErrorLogs(count : number, fromTime : Date) : Promise<ErrorLog[]> {
//         return await this.prisma.getErrorLogs(count,fromTime);
//     } 

//     public async clearErrorLogs() : Promise<number> {
//         return await this.prisma.clearErrorLogs();
//     }

//     async createSubscriptioncSessionURL(userID : string) {
//         return await this.stripe.checkout.sessions.create({
//             mode: "subscription",
//             line_items: [
//                 {
//                     price: process.env.PREMIUM_PRICE_ID!,
//                     quantity: 1
//                 }
//             ],
//             success_url: process.env.SUCCESS_RETURN_URL!,
//             cancel_url: process.env.CANCEL_RETURN_URL!,
//             allow_promotion_codes: true,
//             metadata: {
//                 userID: userID
//             }
//         });
//     }

//     async processSubscriptionPayment(userID: string, subscriptionID : string) : 
//         Promise<User|null> 
//     {
//         if (await this.doesUserExist(userID)) {
//             const newDate = new Date();
//             newDate.setMonth(newDate.getMonth() + 1);
//             return await this.prisma.setUserSubscriptionInfo(userID,newDate,
//                 subscriptionID,true
//             );
//         }
//         return null;
//     }

//     async cancelSubscription(userID : string, ignoreStripe = false) : Promise<User|null> {
//         const user = await this.prisma.getUser(userID);
//         if (user && user.subscriptionID) {
//             const [_, updatedUser] = await Promise.all([
//                 ignoreStripe ?? this.stripe.subscriptions.cancel(user.subscriptionID),
//                 this.prisma.setUserSubscriptionInfo(
//                     userID, user.subscribeEnd, user.subscriptionID, false
//                 )
//             ])
//             return updatedUser;
//         }
//         return null;
//     }

//     async getUserStats(userID : string) : Promise<UserStats|null>{
//         if (await this.doesUserExist(userID)) {
//             const weekStart = startOfWeek(new Date());

//             const allStats = await this.prisma.getUserStats(
//                 userID, new Date(0), new Date(), undefined
//             );
//             const weekStatPromises = Array.from({length: 4}).map( (_, index) =>
//                 this.prisma.getUserStats(
//                     userID, 
//                     subWeeks(weekStart, index), 
//                     index == 0 ? new Date() : subWeeks(weekStart,index - 1), 
//                     index
//                 )
//             )
//             const weekStats = await Promise.all(weekStatPromises);
//             weekStats.sort( (a,b) => ( a.weeksAgo as number ) - ( b.weeksAgo as number) );
            
//             return {
//                 allTime: allStats,
//                 weekly: weekStats
//             }
//         }
//         return null;
//     }
// }

