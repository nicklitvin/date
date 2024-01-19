import { User } from "@prisma/client";
import { PrismaManager } from "./PrismaManager";

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

    private doesUniversityMatchEmail(user : User) {
        const isEdu = user.email.endsWith(".edu");
        const emailUniversity = user.email.split("@")[1].split(".edu")[0];
        
        return isEdu && emailUniversity === user.university;
    }
}

