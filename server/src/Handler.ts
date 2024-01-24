import { Message, Opinion, User } from "@prisma/client";
import { PrismaManager } from "./PrismaManager";
import { MatchPreview, PublicProfile, SwipeFeed } from "./types";
import { doesUniversityMatchEmail } from "./utils";
import { reportsForBan } from "./globals";

export class Handler {
    private prisma : PrismaManager;

    constructor(prismaManager : PrismaManager) {
        this.prisma = prismaManager;
    }

    public async doesUserExist(userID : string) : Promise<boolean> {
        return Boolean(await this.prisma.getUser(userID));
    }
    
    public async createUser(user : User) : Promise<boolean> {
        if (await this.prisma.getUser(user.id)) {
            return false;
        } else if (doesUniversityMatchEmail(user)) {
            return Boolean(await this.prisma.createUser(user));
        } else {
            return false;
        }
    }
    
    public async deleteUser(userID : string) : Promise<boolean> {
        if (await this.prisma.getUser(userID)) {
            return Boolean( (await this.prisma.deleteUser(userID))[0] )
        } else {
            return true;
        }
    }

    public async getProfile(userID : string) : Promise<User|null> {
        return await this.prisma.getUser(userID);
    }

    public async editUser(userID : string, attribute: (keyof User), value : any) : Promise<boolean>{
        try {
            return Boolean(await this.prisma.editUser(userID, attribute, value));
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
}

