import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

export class SwipeHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    // swipeFeed(userID : string) : Promise<SwipeFeed|null> {
    //     return await this.doesUserExist(userID) ? 
    //         await this.prisma.getSwipeFeed(userID) : 
    //         null;
    // }

    // public async makeSwipe(userID : string, swipedUserID : string, action : Opinion) : 
    //     Promise<Swipe|null> 
    // {
    //     const [userExists, swipedExists] = await Promise.all([
    //         this.doesUserExist(userID),
    //         this.doesUserExist(swipedUserID)
    //     ]);
    //     if (userExists && swipedExists && userID != swipedUserID) {
    //         const swipe = await this.prisma.getSwipe(userID, swipedUserID);
    //         if (swipe) {
    //             return await this.prisma.updateSwipe(swipe.id, action);
    //         } else {
    //             return await this.prisma.createSwipe(userID, swipedUserID, action);
    //         }
    //     } else {
    //         return null;
    //     }
    // }

    // public async sendMessage(userID: string, recepientID : string, message : string) : 
    //     Promise<Message|null> 
    // {
    //     const [userExists, recepientExists, doLikeEachOther] = await Promise.all([
    //         this.doesUserExist(userID),
    //         this.doesUserExist(recepientID),
    //         this.prisma.doUsersLikeEachOther(userID, recepientID)  
    //     ])
    //     if (userExists && recepientExists && doLikeEachOther) {
    //         return await this.prisma.makeMessage(userID, recepientID, message);
    //     } else {
    //         return null;
    //     }
    // }
    // public async getSwipeFeed(userID : string) : Promise<SwipeFeed> {
    //     const [user, alreadySwipedIDs, reportedEmails, likedMeIDs] = await Promise.all(
    //         [
    //             this.prisma.user.findUnique({
    //                 where: {
    //                     id: userID
    //                 }
    //             }),
    //             this.prisma.swipe.findMany({
    //                 where: {
    //                     userID: userID
    //                 }
    //             }).then( swipes => swipes.map( (swipe) => swipe.swipedUserID)),
    //             this.prisma.userReport.findMany({
    //                 where: {
    //                     userID: userID
    //                 }
    //             }).then( (report) => report.map( (user) => user.reportedEmail)),
    //             this.prisma.swipe.findMany({
    //                 where: {
    //                     swipedUserID: userID,
    //                     action: "Like"
    //                 }
    //             }).then( swipes => swipes.map( (swipe) => swipe.userID))
    //         ]
    //     );

    //     const results : PublicProfile[] = await this.prisma.user.findMany({
    //         select: {
    //             id: true,
    //             name: true,
    //             age: true,
    //             gender: true,
    //             attributes: true,
    //             interest: true,
    //             description: true,
    //             university: true,
    //             images: true
    //         },
    //         where: {
    //             university: user!.university,
    //             id: {
    //                 notIn: [userID, ...alreadySwipedIDs]
    //             },
    //             email: {
    //                 notIn: reportedEmails
    //             }
    //         },
    //     });
        
    //     const rate = (id : string) => likedMeIDs.includes(id) ? -1 : 0;
    //     results.sort( (a,b) => rate(a.id) - rate(b.id));
    //     return {
    //         feed: results,
    //         likedMeIDs: likedMeIDs
    //     };
    // }

    // public async createSwipe(userID : string, swipedUserID : string, 
    //     action : Opinion, date = new Date()) : Promise<Swipe> 
    // {
    //     return await this.prisma.swipe.create({
    //         data: {
    //             action: action,
    //             swipedUserID: swipedUserID,
    //             userID: userID,
    //             id: randomUUID(),
    //             timestamp: date
    //         }
    //     })
    // }

    // public async updateSwipe(swipeID : string, action : Opinion, date = new Date()) : 
    //     Promise<Swipe> 
    // {
    //     return await this.prisma.swipe.update({
    //         data: {
    //             action: action,
    //             timestamp: date
    //         },
    //         where: {
    //             id: swipeID
    //         }
    //     })
    // }

    // public async getSwipe(userID : string, swipedUserID : string) : Promise<Swipe|null> {
    //     return await this.prisma.swipe.findFirst({
    //         where: {
    //             userID: userID,
    //             swipedUserID: swipedUserID
    //         }
    //     })
    // }   
}