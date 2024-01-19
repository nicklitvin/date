import { PrismaClient, User } from "@prisma/client";

export class PrismaManager {
    protected prisma : PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createUser(user : User) : Promise<void> {
        await this.prisma.user.create({ data: user })
    }
    
    public async deleteUser(userID : string) : Promise<void> {
        await this.prisma.user.delete({
            where: {
                id: userID
            }
        })
    }

    public async getUser(userID : string) : Promise<User|null> {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userID
            }
        });
        return user;
    }

    /**
     * 
     * @param userID 
     * @param change setting must be a column in table User with its associated value type, 
     * will error if invalid and needs to be caught
     */
    public async editUser(userID : string, change: { [setting : string] : any} ) : Promise<void> {
        await this.prisma.user.update({
            where: {
                id: userID
            },
            data: change
        })
    }
}

