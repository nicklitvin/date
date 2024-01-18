import { PrismaManager } from "../src/PrismaManager";

export class TestPrismaManager extends PrismaManager {
    constructor() {
        super()
    }

    public async deleteEverything() {
        await this.prisma.user.deleteMany();
    }

    public async getUserCount(userID? : string) {
        if (userID) {
            return await this.prisma.user.count({
                where: {
                    id: userID
                }
            })
        } else {
            return await this.prisma.user.count();
        }
        
    }
}