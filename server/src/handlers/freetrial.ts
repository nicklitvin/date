import { FreeTrialUsedUser, PrismaClient } from "@prisma/client";

export class FreeTrialHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    async addUser(email : string) : Promise<FreeTrialUsedUser> {
        return await this.prisma.freeTrialUsedUser.create({
            data: {
                email: email,
                timestamp: new Date()
            }
        })
    }

    async hasEmailUsedFreeTrial(email : string) : Promise<boolean> {
        const count = await this.prisma.freeTrialUsedUser.count({
            where: {
                email: email
            }
        })
        return count > 0;
    }

    async deleteAllFreeTrialUsedUsers() : Promise<number> {
        const deleted = await this.prisma.freeTrialUsedUser.deleteMany();
        return deleted.count;
    }
}