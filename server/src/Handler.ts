import { User } from "@prisma/client";
import { PrismaManager } from "./PrismaManager";
import { PublicProfile, SwipeFeed } from "./types";

export class Handler {
    private prisma : PrismaManager;

    constructor(prismaManager : PrismaManager) {
        this.prisma = prismaManager;
    }

    public async doesUserExist(userID : string) : Promise<boolean> {
        const user = await this.prisma.getUser(userID);
        return user != null;
    }
    
    public async createUser(user : User) : Promise<boolean> {
        if (await this.prisma.getUser(user.id)) {
            return false;
        } else if (this.doesUniversityMatchEmail(user)) {
            await this.prisma.createUser(user);
            return true;
        } else {
            return false;
        }
    }
    
    public async deleteUser(userID : string) : Promise<boolean> {
        if (await this.prisma.getUser(userID)) {
            await this.prisma.deleteUser(userID);
        }
        return (await this.prisma.getUser(userID) == null)
    }

    public async getProfile(userID : string) : Promise<User|null> {
        return await this.prisma.getUser(userID);
    }

    public async editUser(userID : string, attribute: (keyof User), value : any) : Promise<boolean>{
        try {
            const approvedChange = {
                [attribute] : value
            }
            await this.prisma.editUser(userID, approvedChange);
            return true;
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

    // PRIVATE

    private doesUniversityMatchEmail(user : User) {
        const isEdu = user.email.endsWith(".edu");
        const emailUniversity = user.email.split("@")[1].split(".edu")[0];
        
        return isEdu && emailUniversity === user.university;
    }
}

