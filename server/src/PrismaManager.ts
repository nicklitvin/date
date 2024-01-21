import { Opinion, Prisma, PrismaClient, Swipe, User } from "@prisma/client";
import { PublicProfile, SwipeFeed } from "./types";
import { randomUUID } from "crypto";

export class PrismaManager {
    protected prisma : PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createUser(user : User) : Promise<User> {
        return await this.prisma.user.create({ data: user })
    }
    
    public async deleteUser(userID : string) : Promise<[User, Prisma.BatchPayload]> {
        return await this.prisma.$transaction([
            this.prisma.user.delete({
                where: {
                    id: userID
                }
            }),
            this.prisma.swipe.deleteMany({
                where: {
                    OR: [
                        {
                            userID: userID 
                        },
                        {
                            swipedUserID: userID
                        }
                    ]
                }
            })
        ])
    }

    public async getUser(userID : string) : Promise<User|null> {
        return await this.prisma.user.findFirst({
            where: {
                id: userID
            }
        });
    }

    public async editUser(userID : string, attribute : (keyof User), value : any) : Promise<User> {
        return await this.prisma.user.update({
            where: {
                id: userID
            },
            data: {
                [attribute]: value
            }
        })
    }

    public async getSwipeFeed(userID : string) : Promise<SwipeFeed> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userID
            }
        });
        const userUniversity = user?.university;

        const alreadySwipedIDs = await this.prisma.swipe.findMany({
            where: {
                userID: userID
            }
        }).then( swipes => swipes.map( (swipe) => swipe.swipedUserID));

        const likedMeIDs = await this.prisma.swipe.findMany({
            where: {
                swipedUserID: userID,
                action: "Like"
            }
        }).then( swipes => swipes.map( (swipe) => swipe.userID));

        const results : PublicProfile[] = await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                age: true,
                gender: true,
                attributes: true,
                interest: true,
                description: true,
                university: true,
                images: true
            },
            where: {
                university: userUniversity,
                id: {
                    notIn: [userID, ...alreadySwipedIDs]
                }
            },
        });
        
        const rate = (id : string) => likedMeIDs.includes(id) ? -1 : 0;
        results.sort( (a,b) => rate(a.id) - rate(b.id));
        return {
            feed: results,
            likedMeIDs: likedMeIDs
        };
    }

    public async createSwipe(userID : string, swipedUserID : string, action : Opinion) : Promise<Swipe> {
        return await this.prisma.swipe.create({
            data: {
                action: action,
                swipedUserID: swipedUserID,
                userID: userID,
                id: randomUUID(),
                timestamp: new Date()
            }
        })
    }

    public async updateSwipe(swipeID : string, action : Opinion) : Promise<Swipe> {
        return await this.prisma.swipe.update({
            data: {
                action: action
            },
            where: {
                id: swipeID
            }
        })
    }

    public async getSwipe(userID : string, swipedUserID : string) : Promise<Swipe|null> {
        return await this.prisma.swipe.findFirst({
            where: {
                userID: userID,
                swipedUserID: swipedUserID
            }
        })
    }
}

