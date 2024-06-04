import { Opinion, PrismaClient, Swipe } from "@prisma/client";
import { randomUUID } from "crypto";
import { MatchDataOutput, SwipeBreakdown, SwipeInput, UserSwipeStats } from "../interfaces";
import { startOfWeek, subWeeks } from "date-fns";
import { sampleContent } from "../globals";

export class SwipeHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async createSwipe(input : SwipeInput, customTime = new Date()) : Promise<Swipe> {
        return await this.prisma.swipe.create({
            data: {
                ...input,
                id: `swipe-${randomUUID()}`,
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

    /**
     * Weekly stats are in reverse order, 1st element represents last week, 2nd represents 
     * week before that
     * 
     * @param userID 
     * @returns 
     */
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

    public async getAllMatches(userID: string, fromTime: Date) : 
        Promise<MatchDataOutput[]> 
    {
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

        const matches : MatchDataOutput[] = [];

        const record = new Map<string,Date>();

        for (const myLike of myLikes) {
            record.set(myLike.swipedUserID, myLike.timestamp);
        }

        for(const liked of likedMe) {
            const myLikeTimestamp = record.get(liked.userID);
            if (myLikeTimestamp) {
                matches.push({
                    userID: liked.userID,
                    timestamp: liked.timestamp.getTime() > myLikeTimestamp.getTime() ?
                        liked.timestamp : myLikeTimestamp
                })
            }
        }

        const filteredMatches = matches.filter( 
            match => match.timestamp.getTime() <= fromTime.getTime()
        );
        filteredMatches.sort( 
            (a,b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        return filteredMatches;
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

    public async createSample() {
        await this.prisma.swipe.deleteMany({
            where: {
                OR: [
                    {
                        userID: sampleContent.userID
                    },
                    {
                        swipedUserID: sampleContent.userID
                    }
                ]
            }
        })
        return Promise.all([
            this.createSwipe({
                userID: "newmatch1",
                action: "Like",
                swipedUserID: sampleContent.userID
            }),
            this.createSwipe({
                userID: "newmatch2",
                action: "Like",
                swipedUserID: sampleContent.userID
            }),
            this.createSwipe({
                userID: sampleContent.userID,
                action: "Like",
                swipedUserID: "newmatch1"
            }),
            this.createSwipe({
                userID: sampleContent.userID,
                action: "Like",
                swipedUserID: "newmatch2"
            }),
            this.createSwipe({
                userID: "oldmatch1",
                action: "Like",
                swipedUserID: sampleContent.userID
            }),
            this.createSwipe({
                userID: "oldmatch2",
                action: "Like",
                swipedUserID: sampleContent.userID
            }),
            this.createSwipe({
                userID: sampleContent.userID,
                action: "Like",
                swipedUserID: "oldmatch1"
            }),
            this.createSwipe({
                userID: sampleContent.userID,
                action: "Like",
                swipedUserID: "oldmatch2"
            }),
        ])
    }

    public async deleteSwipesWithUser(userID: string) : Promise<number> {
        const deleted = await this.prisma.swipe.deleteMany({
            where: {
                OR: [
                    {userID: userID},
                    {swipedUserID: userID}
                ]
            }
        });
        return deleted.count;
    }

    public async getSwipeCountWithUser(userID: string) : Promise<number> {
        return await this.prisma.swipe.count({
            where: {
                OR: [
                    {userID: userID},
                    {swipedUserID: userID}
                ]
            }
        })
    }
}