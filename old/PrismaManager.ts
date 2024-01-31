// import { Announcement, Attribute, AttributeType, ErrorLog, Message, Opinion, Prisma, PrismaClient, Swipe, User, UserReport } from "@prisma/client";
// import { LikeDislike, MatchPreview, PublicProfile, SwipeFeed, UserDelete } from "./types";
// import { randomUUID } from "crypto";
// import { matchPreviewMessageCount } from "./globals";

// export class PrismaManager {
//     protected prisma : PrismaClient;

//     constructor() {
//         this.prisma = new PrismaClient();
//     }

//     // ANOUNCEMENT

//     public async makeAnnouncement(announcement : Announcement) : Promise<Announcement> {
//         return await this.prisma.announcement.create({
//             data: announcement
//         })
//     } 

//     public async getCurrentAnnouncements() : Promise<Announcement[]> {
//         return await this.prisma.announcement.findMany({
//             where: {
//                 startTime: {
//                     lte: new Date()
//                 },
//                 endTime: {
//                     gte: new Date()
//                 }
//             }
//         })
//     }

//     public async getAllAnouncements() : Promise<Announcement[]> {
//         return await this.prisma.announcement.findMany();
//     }

//     public async deleteAnnouncement(id : string) : Promise<Announcement> {
//         return await this.prisma.announcement.delete({
//             where: {
//                 id: id
//             }
//         })
//     }

//     public async deleteAllAnouncements() : Promise<number> {
//         const deleted = await this.prisma.announcement.deleteMany();
//         return deleted.count;
//     }

//     public async getAnnouncementByID(id : string) : Promise<Announcement|null> {
//         return await this.prisma.announcement.findUnique({
//             where: {
//                 id: id
//             }
//         })
//     }

//     // ATTRIBUTES

//     public async getAttribute(type : AttributeType) : Promise<Attribute|null> {
//         return await this.prisma.attribute.findUnique({
//             where: {
//                 type: type
//             }
//         })
//     }

//     public async getAttributes() : Promise<Attribute[]> {
//         return await this.prisma.attribute.findMany()
//     }

//     public async editAttribute() : Promise<Attribute> {
        
//     }

//     public async addAttributeValue(input ) : 
//         Promise<Attribute> 
//     {
//         const attributeEntry = await this.prisma.attribute.findUnique({
//             where: {
//                 type: type
//             }
//         }) as Attribute;

//         const newList = [...attributeEntry.values, value];
//         newList.sort()

//         return await this.prisma.attribute.update({
//             data: {
//                 values: newList
//             },
//             where: {
//                 type: type
//             }
//         }) 
//     }

//     public async deleteAttributeValue(type : AttributeType, value: string) : 
//         Promise<Attribute|null> 
//     {
//         const currentAttributes = await this.prisma.attribute.findUnique({
//             where: {
//                 type: type
//             }
//         }) as Attribute;

//         const revisedAttributes = currentAttributes.values.filter( 
//             (attribute) => attribute != value
//         );
//         return await this.prisma.attribute.update({
//             where: {
//                 type: type
//             },
//             data: {
//                 values: revisedAttributes
//             }
//         })
//     }

    

//     // OLD


//     public async createUser(user : User) {
//         return await this.prisma.user.create({ data: user })
//     }
    
//     public async deleteUser(userID : string) : Promise<UserDelete> {
//         const transaction = await this.prisma.$transaction([
//             this.prisma.user.deleteMany({
//                 where: {
//                     id: userID
//                 }
//             }),
//             this.prisma.swipe.deleteMany({
//                 where: {
//                     OR: [
//                         {
//                             userID: userID 
//                         },
//                         {
//                             swipedUserID: userID
//                         }
//                     ]
//                 }
//             }),
//             this.prisma.message.deleteMany({
//                 where: {
//                     userID: userID
//                 }
//             })
//         ])
//         return {
//             user: transaction[0].count,
//             swipes: transaction[1].count,
//             messages: transaction[2].count
//         }
//     }

//     public async getUser(userID : string) : Promise<User|null> {
//         return await this.prisma.user.findUnique({
//             where: {
//                 id: userID
//             }
//         });
//     }

//     public async editUser(userID : string, setting : (keyof User), value : any) : 
//         Promise<User> 
//     {
//         return await this.prisma.user.update({
//             where: {
//                 id: userID
//             },
//             data: {
//                 [setting]: value
//             }
//         })
//     }

//     public async getSwipeFeed(userID : string) : Promise<SwipeFeed> {
//         const [user, alreadySwipedIDs, reportedEmails, likedMeIDs] = await Promise.all(
//             [
//                 this.prisma.user.findUnique({
//                     where: {
//                         id: userID
//                     }
//                 }),
//                 this.prisma.swipe.findMany({
//                     where: {
//                         userID: userID
//                     }
//                 }).then( swipes => swipes.map( (swipe) => swipe.swipedUserID)),
//                 this.prisma.userReport.findMany({
//                     where: {
//                         userID: userID
//                     }
//                 }).then( (report) => report.map( (user) => user.reportedEmail)),
//                 this.prisma.swipe.findMany({
//                     where: {
//                         swipedUserID: userID,
//                         action: "Like"
//                     }
//                 }).then( swipes => swipes.map( (swipe) => swipe.userID))
//             ]
//         );

//         const results : PublicProfile[] = await this.prisma.user.findMany({
//             select: {
//                 id: true,
//                 name: true,
//                 age: true,
//                 gender: true,
//                 attributes: true,
//                 interest: true,
//                 description: true,
//                 university: true,
//                 images: true
//             },
//             where: {
//                 university: user!.university,
//                 id: {
//                     notIn: [userID, ...alreadySwipedIDs]
//                 },
//                 email: {
//                     notIn: reportedEmails
//                 }
//             },
//         });
        
//         const rate = (id : string) => likedMeIDs.includes(id) ? -1 : 0;
//         results.sort( (a,b) => rate(a.id) - rate(b.id));
//         return {
//             feed: results,
//             likedMeIDs: likedMeIDs
//         };
//     }

//     public async createSwipe(userID : string, swipedUserID : string, 
//         action : Opinion, date = new Date()) : Promise<Swipe> 
//     {
//         return await this.prisma.swipe.create({
//             data: {
//                 action: action,
//                 swipedUserID: swipedUserID,
//                 userID: userID,
//                 id: randomUUID(),
//                 timestamp: date
//             }
//         })
//     }

//     public async updateSwipe(swipeID : string, action : Opinion, date = new Date()) : 
//         Promise<Swipe> 
//     {
//         return await this.prisma.swipe.update({
//             data: {
//                 action: action,
//                 timestamp: date
//             },
//             where: {
//                 id: swipeID
//             }
//         })
//     }

//     public async getSwipe(userID : string, swipedUserID : string) : Promise<Swipe|null> {
//         return await this.prisma.swipe.findFirst({
//             where: {
//                 userID: userID,
//                 swipedUserID: swipedUserID
//             }
//         })
//     }

//     public async doUsersLikeEachOther(userID : string, otherUserID : string) : 
//         Promise<boolean> 
//     {
//         const [userLikesOther, otherLikesUser] = await Promise.all([
//             this.prisma.swipe.count({
//                 where: {
//                     userID: userID,
//                     swipedUserID: otherUserID,
//                     action: "Like"
//                 }
//             }),
//             this.prisma.swipe.count({
//                 where: {
//                     userID: otherUserID,
//                     swipedUserID: userID,
//                     action: "Like"
//                 }
//             })

//         ]) 
//         return userLikesOther == 1 && otherLikesUser == 1;
//     }

//     public async makeMessage(userID : string, recepientID : string, message : string, 
//         date = new Date()) : Promise<Message> 
//     {
//         return await this.prisma.message.create({
//             data: {
//                 id: randomUUID(),
//                 message: message,
//                 readStatus: false,
//                 userID: userID,
//                 recepientID: recepientID,
//                 timestamp: date
//             }
//         })
//     }

//     public async updateUserReadStatus(userID : string, fromID : string) : Promise<number> {
//         const update = await this.prisma.message.updateMany({
//             where: {
//                 recepientID: userID,
//                 userID: fromID,
//                 readStatus: false
//             },
//             data: {
//                 readStatus: true
//             }
//         })
//         return update.count;
//     }

//     public async getMessages(userID : string, withID : string, count: number, 
//         fromTime: Date) : Promise<Message[]> 
//     {
//         return await this.prisma.message.findMany({
//             where: {
//                 AND: [
//                     {
//                         OR: [
//                             {
//                                 userID: userID,
//                                 recepientID: withID
//                             },
//                             {
//                                 userID: withID,
//                                 recepientID: userID
//                             }
//                         ]
//                     },
//                     {
//                         timestamp: {
//                             lte: fromTime
//                         }
//                     }
//                 ] 
//             },
//             orderBy: {
//                 timestamp: "desc"
//             },
//             take: count
//         })
//     }

//     public async getPublicProfile(userID : string) : Promise<PublicProfile|null> {
//         return await this.prisma.user.findFirst({
//             where: {
//                 id: userID
//             },
//             select: {
//                 id: true,
//                 age: true,
//                 attributes: true,
//                 description: true,
//                 gender: true,
//                 images: true,
//                 name: true,
//                 university: true
//             }
//         })
//     }

//     private async getMesssageLog(userID : string, fromTime : Date, count : number) {
//         const [messageFromUserID, messageToUserID] = await Promise.all([
//             this.prisma.message.findMany({
//                 where: {
//                     userID: userID,
//                     timestamp: {
//                         lte: fromTime
//                     }
//                 },
//                 orderBy: {
//                     timestamp: "desc"
//                 },
//                 distinct: ["recepientID"],
//                 take: count
//             }),
//             this.prisma.message.findMany({
//                 where: {
//                     recepientID: userID,
//                     timestamp: {
//                         lte: fromTime
//                     }
//                 },
//                 orderBy: {
//                     timestamp: "desc"
//                 },
//                 distinct: ["userID"],
//                 take: count
//             })
//         ]);

//         return {messageFromUserID, messageToUserID};
//     } 

//     public async getChatPreviews(userID : string, fromTime : Date, count : number) : 
//         Promise<MatchPreview[]> 
//     {
//         const {messageFromUserID, messageToUserID} = await this.getMesssageLog(
//             userID, fromTime, count
//         );

//         const combined = messageFromUserID.concat(messageToUserID).sort( 
//             (a,b) => b.timestamp.getTime() - a.timestamp.getTime()
//         );

//         const getMatchPreview = async (message : Message) => {
//             const [profile, lastMessages] = await Promise.all([
//                 message.userID == userID ? 
//                     this.getPublicProfile(message.recepientID) : 
//                     this.getPublicProfile(message.userID),
//                 this.getMessages(userID, message.recepientID, 
//                     matchPreviewMessageCount, new Date()
//                 )
//             ])
//             return {profile, lastMessages}
//         }

//         const matchPreviews = await Promise.all(combined.map((message) => 
//             getMatchPreview(message))
//         );
//         const usedUserIDs = new Set<string>();
//         const result : MatchPreview[] = [];

//         for (const matchPreview of matchPreviews) {
//             if (result.length == count) break;

//             const profile = matchPreview.profile as PublicProfile;

//             if (!usedUserIDs.has(profile.id)) {
//                 usedUserIDs.add(profile.id);
//                 result.push(matchPreview as MatchPreview);
//             }
//         }

//         return result
//     }

//     public async deleteChat(userID : string, withID : string) : Promise<number> {
//         const deleted = await this.prisma.message.deleteMany({
//             where: {
//                 OR: [
//                     {
//                         userID: userID,
//                         recepientID: withID
//                     },
//                     {
//                         userID: withID,
//                         recepientID: userID
//                     }
//                 ]
//             }
//         })
//         return deleted.count;
//     }

//     public async reportUser(userID : string, reportedID : string, date = new Date()) : 
//         Promise<UserReport> 
//     {
//         const user = await this.getUser(reportedID) as User;
//         await this.deleteChat(userID, reportedID);

//         return await this.prisma.userReport.create({
//             data: {
//                 userID: userID,
//                 reportedEmail: user.email,
//                 id: randomUUID() as string,
//                 timestamp: date
//             }
//         })
//     }

//     public async doesReportExist(userID : string, reportedID : string) : Promise<boolean>{
//         const user = await this.getUser(reportedID) as User;
//         const report = await this.prisma.userReport.findFirst({
//             where: {
//                 userID: userID,
//                 reportedEmail: user.email
//             }
//         })
//         return Boolean(report);
//     }

//     public async getReportCount(userEmail : string) : Promise<number> {
//         return await this.prisma.userReport.count({
//             where: {
//                 reportedEmail: userEmail
//             }
//         })
//     }

//     public async addImage(userID : string, imageID : string) : Promise<User> {
//         return await this.prisma.user.update({
//             where: {
//                 id: userID
//             },
//             data: {
//                 images: {
//                     push: imageID
//                 }
//             }
//         })
//     }

//     public async deleteImage(userID : string, imageID : string) : Promise<User> {
//         const user = await this.prisma.user.findUnique({
//             where: {
//                 id: userID
//             }
//         });

//         const newImageList = user?.images.filter( (val) => val != imageID);

//         return await this.prisma.user.update({
//             where: {
//                 id: userID
//             },
//             data: {
//                 images: newImageList
//             }
//         })
//     }

//     public async changeImageOrder(userID : string, imageIDs : string[]) : Promise<User>{
//         return await this.prisma.user.update({
//             where: {
//                 id: userID
//             },
//             data: {
//                 images: imageIDs
//             }
//         })
//     }

//     public async recordError(error : ErrorLog) : Promise<ErrorLog> {
//         return await this.prisma.errorLog.create({
//             data: {
//                 id: randomUUID(),
//                 timestamp: error.timestamp,
//                 device: error.device,
//                 message: error.message
//             }
//         })
//     }

//     public async getErrorLogs(count : number, fromTime : Date) : Promise<ErrorLog[]>{
//         return await this.prisma.errorLog.findMany({
//             where: {
//                 timestamp: {
//                     lte: fromTime
//                 }
//             },
//             orderBy: {
//                 timestamp: "desc"
//             },
//             take: count
//         })
//     }

//     public async clearErrorLogs() : Promise<number> {
//         const deleted = await this.prisma.errorLog.deleteMany();
//         return deleted.count;
//     }

//     public async setUserSubscriptionInfo(userID : string, endDate : Date, 
//         subscriptionId : string, isSubscribed : boolean) : Promise<User> 
//     {
//         return await this.prisma.user.update({
//             where: {
//                 id: userID
//             },
//             data: {
//                 subscribeEnd: endDate,
//                 isSubscribed: isSubscribed,
//                 subscriptionID: subscriptionId
//             }
//         })
//     }

//     public async getUserStats(userID : string, fromTime : Date, toTime : Date, 
//         weeksAgo : number | undefined) : Promise<LikeDislike> 
//     {
//         const [myLikes, myDislikes, likedMe, dislikedMe] = await Promise.all([
//             this.prisma.swipe.count({
//                 where: {
//                     userID: userID,
//                     action: "Like",
//                     timestamp: {
//                         lte: toTime,
//                         gte: fromTime
//                     }
//                 }
//             }),
//             this.prisma.swipe.count({
//                 where: {
//                     userID: userID,
//                     action: "Dislike",
//                     timestamp: {
//                         lte: toTime,
//                         gte: fromTime
//                     }
//                 },
//             }),
//             this.prisma.swipe.count({
//                 where: {
//                     swipedUserID: userID,
//                     action: "Like",
//                     timestamp: {
//                         lte: toTime,
//                         gte: fromTime
//                     }
//                 }
//             }),
//             this.prisma.swipe.count({
//                 where: {
//                     swipedUserID: userID,
//                     action: "Dislike",
//                     timestamp: {
//                         lte: toTime,
//                         gte: fromTime
//                     }
//                 }
//             })
//         ])
        
//         return { myLikes, myDislikes, likedMe, dislikedMe, weeksAgo }
//     } 
// }       

