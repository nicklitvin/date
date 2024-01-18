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
        } else {
            await this.prisma.createUser(user);
            return true;
        }
    }
    
    public async deleteUser(userID : string) : Promise<boolean> {
        if (await this.prisma.getUser(userID)) {
            await this.prisma.deleteUser(userID);
        }
        return (await this.prisma.getUser(userID) == null)
    }
}

