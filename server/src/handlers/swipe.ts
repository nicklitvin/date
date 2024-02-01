import { PrismaClient, Swipe } from "@prisma/client";
import { randomUUID } from "crypto";
import { SwipeBreakdown, SwipeInput, UserSwipeStats } from "../types";
import { startOfWeek, subWeeks } from "date-fns";

export class SwipeHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async createSwipe(input : SwipeInput, customTime = new Date()) : Promise<Swipe> {
        return await this.prisma.swipe.create({
            data: {
                ...input,
                id: randomUUID(),
                timestamp: customTime,
            }
        })
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

    public async getSwipeByID(id : string) : Promise<Swipe|null> {
        return await this.prisma.swipe.findUnique({
            where: {
                id: id
            }
        })
    }

    public async getSwipeByUsers(userID : string, swipedUserID : string) : 
        Promise<Swipe|null> 
    {
        return await this.prisma.swipe.findFirst({
            where: {
                userID: userID,
                swipedUserID: swipedUserID
            }
        })
    }

    public async deleteSwipe(id : string) : Promise<Swipe|null> {
        return await this.getSwipeByID(id) ?
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

    public async getSwipeBreakdown(userID: string, from: Date, to: Date) : 
        Promise<SwipeBreakdown> 
    {
        const [myLikes, myDislikes, likedMe, dislikedMe] = await Promise.all([
            this.prisma.swipe.count({
                where: {
                    userID: userID,
                    action: "Like",
                    timestamp: { gte: from, lte: to }
                }
            }),
            this.prisma.swipe.count({
                where: {
                    userID: userID,
                    action: "Dislike",
                    timestamp: { gte: from, lte: to }
                },
            }),
            this.prisma.swipe.count({
                where: {
                    swipedUserID: userID,
                    action: "Like",
                    timestamp: { gte: from, lte: to }
                }
            }),
            this.prisma.swipe.count({
                where: {
                    swipedUserID: userID,
                    action: "Dislike",
                    timestamp: { gte: from, lte: to }
                }
            })
        ]);
        return { myLikes, myDislikes, likedMe, dislikedMe}
    }

    public async getUserSwipeStats(userID : string) : Promise<UserSwipeStats> {
        const weekStart = startOfWeek(new Date());

        const [allTime, week0, week1, week2, week3] = await Promise.all([
            this.getSwipeBreakdown(userID, new Date(0), new Date()),
            this.getSwipeBreakdown(userID, weekStart, new Date()),
            this.getSwipeBreakdown(userID, subWeeks(weekStart, 1), 
                weekStart
            ),
            this.getSwipeBreakdown(userID, subWeeks(weekStart, 2), 
                subWeeks(weekStart, 1)
            ),
            this.getSwipeBreakdown(userID, subWeeks(weekStart, 3), 
                subWeeks(weekStart, 2)
            )
        ])

        return {
            allTime: allTime,
            weekly: [week0, week1, week2, week3]
        }
    }
}