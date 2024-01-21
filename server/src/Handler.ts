import { Opinion, User } from "@prisma/client";
import { PrismaManager } from "./PrismaManager";
import { PublicProfile, SwipeFeed } from "./types";
import { doesUniversityMatchEmail } from "./utils";

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
        return await this.prisma.getUser(userID) ? 
            Boolean( (await this.prisma.deleteUser(userID))[0] ) :
            true;
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
        const profile = await this.getProfile(userID);
        return profile ?
        {
            id: profile.id,
            age: profile.age,
            attributes: profile.attributes,
            description: profile.description,
            gender: profile.gender,
            images: profile.images,
            name: profile.name,
            university: profile.university
        } : null
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
        if (await this.doesUserExist(userID) && await this.doesUserExist(swipedUserID)) {
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
}

