import { PrismaClient, Swipe } from "@prisma/client";
import { randomUUID } from "crypto";
import { SwipeInput } from "../types";

export class SwipeHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async createSwipe(input : SwipeInput) : Promise<Swipe|null> {
        const count = await this.prisma.swipe.count({
            where: {
                userID: input.userID,
                swipedUserID: input.swipedUserID
            }
        });

        return count == 0 ?
            await this.prisma.swipe.create({
                data: {
                    ...input,
                    id: randomUUID(),
                    timestamp: new Date(),
                }
            }) :
            null;
    }

    public async updateSwipe(id : string, input : SwipeInput) : Promise<Swipe|null> {
        return await this.prisma.swipe.update({
            where: {
                id: id
            },
            data: {
                action: input.action,
                timestamp: new Date()
            }
        })
    }

    public async getSwipe(id : string) : Promise<Swipe|null> {
        return await this.prisma.swipe.findUnique({
            where: {
                id: id
            }
        })
    }

    public async deleteSwipe(id : string) : Promise<Swipe|null> {
        return await this.getSwipe(id) ?
            await this.prisma.swipe.delete({
                where: {
                    id: id
                }
            }) :
            null
    }

    public async deleteAllSwipes() : Promise<number> {
        const deleted = await this.prisma.swipe.deleteMany();
        return deleted.count;
    }
}