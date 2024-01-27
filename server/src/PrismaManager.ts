import { AttributeType, ErrorLog, Message, Opinion, Prisma, PrismaClient, Swipe, User } from "@prisma/client";
import { MatchPreview, PublicProfile, SwipeFeed } from "./types";
import { randomUUID } from "crypto";
import { matchPreviewMessageCount } from "./globals";

export class PrismaManager {
    protected prisma : PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createUser(user : User) : Promise<User> {
        return await this.prisma.user.create({ data: user })
    }
    
    public async deleteUser(userID : string) : Promise<[User, Prisma.BatchPayload, Prisma.BatchPayload]> {
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
            }),
            this.prisma.message.deleteMany({
                where: {
                    userID: userID
                }
            })
        ])
    }

    public async getUser(userID : string) : Promise<User|null> {
        return await this.prisma.user.findUnique({
            where: {
                id: userID
            }
        });
    }

    public async editUser(userID : string, setting : (keyof User), value : any) : Promise<User> {
        return await this.prisma.user.update({
            where: {
                id: userID
            },
            data: {
                [setting]: value
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

        const reportedEmails = await this.prisma.report.findMany({
            where: {
                userID: userID
            }
        }).then( (report) => report.map( (user) => user.reportedEmail))

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
                },
                email: {
                    notIn: reportedEmails
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

    public async doUsersLikeEachOther(userID : string, otherUserID : string) : Promise<boolean> {
        const userLikesOther = await this.prisma.swipe.count({
            where: {
                userID: userID,
                swipedUserID: otherUserID,
                action: "Like"
            }
        })
        const otherLikesUser = await this.prisma.swipe.count({
            where: {
                userID: otherUserID,
                swipedUserID: userID,
                action: "Like"
            }
        })
        return userLikesOther == 1 && otherLikesUser == 1;
    }

    public async makeMessage(userID : string, recepientID : string, message : string) : Promise<Message> {
        return await this.prisma.message.create({
            data: {
                id: randomUUID(),
                message: message,
                readStatus: false,
                userID: userID,
                recepientID: recepientID,
                timestamp: new Date()
            }
        })
    }

    public async updateUserReadStatus(userID : string, fromID : string) : Promise<Prisma.BatchPayload> {
        return await this.prisma.message.updateMany({
            where: {
                recepientID: userID,
                userID: fromID,
                readStatus: false
            },
            data: {
                readStatus: true
            }
        })
    }

    public async getMessages(userID : string, withID : string, count: number, fromTime: Date) {
        return await this.prisma.message.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                userID: userID,
                                recepientID: withID
                            },
                            {
                                userID: withID,
                                recepientID: userID
                            }
                        ]
                    },
                    {
                        timestamp: {
                            lte: fromTime
                        }
                    }
                ] 
            },
            orderBy: {
                timestamp: "desc"
            },
            take: count
        })
    }
    public async getPublicProfile(userID : string) : Promise<PublicProfile|null> {
        return await this.prisma.user.findFirst({
            where: {
                id: userID
            },
            select: {
                id: true,
                age: true,
                attributes: true,
                description: true,
                gender: true,
                images: true,
                name: true,
                university: true
            }
        })
    }

    public async getChatPreviews(userID : string, fromTime : Date, count : number) : Promise<MatchPreview[]> {
        const messageFromUserID = await this.prisma.message.findMany({
            where: {
                userID: userID,
                timestamp: {
                    lte: fromTime
                }
            },
            orderBy: {
                timestamp: "desc"
            },
            distinct: ["recepientID"],
            take: count
        })

        const messageToUserID = await this.prisma.message.findMany({
            where: {
                recepientID: userID,
                timestamp: {
                    lte: fromTime
                }
            },
            orderBy: {
                timestamp: "desc"
            },
            distinct: ["userID"],
            take: count
        })

        const combined = messageFromUserID.concat(messageToUserID).sort( 
            (a,b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        const usedUserIDs = new Set<string>();
        const result : MatchPreview[] = [];

        for (let message of combined) {
            if (result.length == count) break;

            if (message.userID == userID && !usedUserIDs.has(message.recepientID)) {
                usedUserIDs.add(message.recepientID);
                result.push({
                    profile: (await this.getPublicProfile(message.recepientID))!,
                    lastMessages: await this.getMessages(userID, message.recepientID, matchPreviewMessageCount, new Date())
                })

            } else if (message.recepientID == userID && !usedUserIDs.has(message.userID)) {
                usedUserIDs.add(message.userID);
                result.push({
                    profile: (await this.getPublicProfile(message.userID))!,
                    lastMessages: await this.getMessages(userID, message.recepientID, matchPreviewMessageCount, new Date())
                })
            }
        }
        return result;
    }

    public async deleteChat(userID : string, withID : string) {
        return await this.prisma.message.deleteMany({
            where: {
                OR: [
                    {
                        userID: userID,
                        recepientID: withID
                    },
                    {
                        userID: withID,
                        recepientID: userID
                    }
                ]
            }
        })
    }

    public async reportUser(userID : string, reportedID : string) {
        const reportedUserEmail = (await this.getUser(reportedID))!.email;

        await this.deleteChat(userID, reportedID);

        return await this.prisma.report.create({
            data: {
                userID: userID,
                reportedEmail: reportedUserEmail,
                id: randomUUID(),
                timestamp: new Date()
            }
        })
    }

    public async doesReportExist(userID : string, reportedID : string) {
        const reportedUserEmail = (await this.getUser(reportedID))!.email;
        
        return Boolean(await this.prisma.report.findFirst({
            where: {
                userID: userID,
                reportedEmail: reportedUserEmail
            }
        }))
    }

    public async getReportCount(userEmail : string) {
        return await this.prisma.report.count({
            where: {
                reportedEmail: userEmail
            }
        })
    }

    public async getAttributes() {
        return await this.prisma.attribute.findMany()
    }

    public async deleteAttribute(type : AttributeType, title: string) {
        const currentAttributes = await this.prisma.attribute.findUnique({
            where: {
                type: type
            }
        });

        if (currentAttributes) {
            const revisedAttributes = currentAttributes.values.filter( 
                (attribute) => attribute != title
            );
            if (revisedAttributes.length == 0) {
                return await this.prisma.attribute.delete({
                    where: {
                        type: type
                    }
                })
            } else {
                return await this.prisma.attribute.update({
                    where: {
                        type: type
                    },
                    data: {
                        values: revisedAttributes
                    }
                })
            }
        }
    }

    public async createAttribute(type : AttributeType, title : string) {
        const currentAttributes = await this.prisma.attribute.findUnique({
            where: {
                type: type
            }
        });

        if (currentAttributes) {
            const newList = [...currentAttributes.values, title];
            newList.sort()

            return await this.prisma.attribute.update({
                data: {
                    values: newList
                },
                where: {
                    type: type
                }
            })
        } else {
            return await this.prisma.attribute.create({
                data: {
                    type: type,
                    values: [title]
                }
            })
        }
    }

    public async addImage(userID : string, imageID : string) {
        return await this.prisma.user.update({
            where: {
                id: userID
            },
            data: {
                images: {
                    push: imageID
                }
            }
        })
    }

    public async deleteImage(userID : string, imageID : string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userID
            }
        });

        const newImageList = user?.images.filter( (val) => val != imageID);

        return await this.prisma.user.update({
            where: {
                id: userID
            },
            data: {
                images: newImageList
            }
        })
    }

    public async changeImageOrder(userID : string, imageIDs : string[]) {
        return await this.prisma.user.update({
            where: {
                id: userID
            },
            data: {
                images: imageIDs
            }
        })
    }

    public async logError(device : string, message : string, date : Date) {
        return await this.prisma.errorLog.create({
            data: {
                id: randomUUID(),
                timestamp: date,
                device: device,
                message: message
            }
        })
    }

    public async getErrorLogs(count : number, fromTime : Date) {
        return await this.prisma.errorLog.findMany({
            where: {
                timestamp: {
                    lte: fromTime
                }
            },
            orderBy: {
                timestamp: "desc"
            },
            take: count
        })
    }

    public async clearErrorLogs() {
        return this.prisma.errorLog.deleteMany();
    }
}       

