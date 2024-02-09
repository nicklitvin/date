import { Opinion, PrismaClient, Swipe } from "@prisma/client";
import { randomUUID } from "crypto";
import { SwipeBreakdown, SwipeInput, UserSwipeStats } from "../interfaces";
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

    public async updateSwipe(id : string, action : Opinion) : Promise<Swipe|null> {
        return await this.prisma.swipe.update({
            where: {
                id: id
            },
            data: {
                action: action,
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

    public async getAllMatches(userID: string, fromTime: Date) : Promise<string[]> {
        const [myLikes, likedMe] = await Promise.all([
            this.prisma.swipe.findMany({
                where: {
                    userID: userID,
                    action: "Like",
                },
                select: {
                    swipedUserID: true,
                    timestamp: true
                }
            }),
            this.prisma.swipe.findMany({
                where: {
                    swipedUserID: userID,
                    action: "Like",
                },
                select: {
                    userID: true,
                    timestamp: true
                }
            })
        ]);

        const matches : {
            matchUserID: string
            matchTimestamp: Date
        }[] = [];

        const record = new Map<string,Date>();

        for (const myLike of myLikes) {
            record.set(myLike.swipedUserID, myLike.timestamp);
        }

        for(const liked of likedMe) {
            const myLikeTimestamp = record.get(liked.userID);
            if (myLikeTimestamp) {
                matches.push({
                    matchUserID: liked.userID,
                    matchTimestamp: liked.timestamp.getTime() > myLikeTimestamp.getTime() ?
                        liked.timestamp : myLikeTimestamp
                })
            }
        }

        const filteredMatches = matches.filter( 
            match => match.matchTimestamp.getTime() <= fromTime.getTime()
        );
        filteredMatches.sort( 
            (a,b) => b.matchTimestamp.getTime() - a.matchTimestamp.getTime()
        );
        return filteredMatches.map( val => val.matchUserID);
    }
    
    public async getLikedMeUsers(userID: string) : Promise<string[]> {
        return await this.prisma.swipe.findMany({
            where: {
                swipedUserID: userID,
                action: "Like"
            }
        }).then(users => users.map(user => user.userID))
    }

    public async getSwipedUsers(userID: string) : Promise<string[]> {
        return await this.prisma.swipe.findMany({
            where: {
                userID: userID
            }
        }).then(users => users.map(user => user.swipedUserID));
    }
}