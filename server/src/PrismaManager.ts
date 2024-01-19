import { Opinion, PrismaClient, Swipe, User } from "@prisma/client";
import { PublicProfile, SwipeFeed } from "./types";
import { randomUUID } from "crypto";

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
        }).then( users => users.map( (user) => user.id));

        const likedMeIDs = await this.prisma.swipe.findMany({
            where: {
                swipedUserID: userID,
                action: "Like"
            }
        }).then( users => users.map( (user) => user.id));

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

    public async createSwipe(userID : string, swipedUserID : string, action : Opinion) : Promise<void> {
        await this.prisma.swipe.create({
            data: {
                action: action,
                swipedUserID: swipedUserID,
                userID: userID,
                id: randomUUID(),
                timestamp: new Date()
            }
        })
    }

    public async updateSwipe(swipeID : string, action : Opinion) : Promise<void> {
        await this.prisma.swipe.update({
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

