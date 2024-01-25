import { randomUUID } from "crypto";
import { PrismaManager } from "../src/PrismaManager";

export class TestPrismaManager extends PrismaManager {
    constructor() {
        super()
    }

    public async deleteEverything() {
        await this.prisma.user.deleteMany();
        await this.prisma.swipe.deleteMany();
        await this.prisma.message.deleteMany();
        await this.prisma.report.deleteMany();
        await this.prisma.attribute.deleteMany();
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

    public async getSwipeCount(userID? : string) {
        if (userID) {
            return await this.prisma.swipe.count({
                where: {
                    userID: userID
                }
            })
        } else {
            return await this.prisma.swipe.count();
        }
    }

    public async getMessageCount(userID? : string) {
        if (userID) {
            return await this.prisma.message.count({
                where: {
                    OR: [
                        {userID: userID},
                        {recepientID: userID}
                    ]
                }
            })
        } else {
            return await this.prisma.message.count();
        }
    }

    public async getChatLog(userID : string, otherID : string) {
        return await this.prisma.message.findMany({
            where: {
                OR: [
                    {
                        userID: userID, 
                        recepientID: otherID
                    },
                    {
                        userID: otherID,
                        recepientID: userID
                    }
                ]
            },
            orderBy: {
                timestamp: "desc"
            }
        })
    }

    public async createChatAtTime(userID : string, recepientID : string, time : Date, message : string) {
        return await this.prisma.message.create({
            data: {
                id: randomUUID(),
                message: message,
                readStatus: false,
                recepientID: recepientID,
                timestamp: time,
                userID: userID
            }
        })
    }
}