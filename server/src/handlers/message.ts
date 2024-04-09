import { Message, PrismaClient } from "@prisma/client";
import { GetChatInput, GetMatchesInput, MessageInput, ReadStatusInput } from "../interfaces";
import { randomUUID } from "crypto";
import { miscConstants, sampleContent } from "../globals";

export class MessageHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async sendMessage(input : MessageInput, customTime = new Date()) : 
        Promise<Message> 
    {
        return await this.prisma.message.create({
            data: {
                ...input,
                id: randomUUID(),
                readStatus: false,
                timestamp: customTime
            }
        })
    }

    public async updateReadStatus(input : ReadStatusInput) : Promise<number> {
        const updated = await this.prisma.message.updateMany({
            where: {
                userID: input.toID,
                recepientID: input.userID,
                timestamp: {
                    "lte": input.timestamp
                }
            },
            data: {
                readStatus: true
            }
        })
        return updated.count;
    }

    public async hasUserReadLatestMessage(input : {
        senderID : string
        receiverID : string
    }) : Promise<boolean> {
        const message = await this.prisma.message.findMany({
            where: {
                userID: input.senderID,
                recepientID: input.receiverID
            },
            orderBy: {
                timestamp: "desc"
            },
            take: 1
        });
        return message.length > 0 ? message[0].readStatus : false;
    }

    public async getMessage(id : string) : Promise<Message|null> {
        return await this.prisma.message.findUnique({
            where: {
                id: id
            }
        })
    }

    public async deleteMessage(id : string) : Promise<Message|null> {
        return await this.getMessage(id) ? 
            await this.prisma.message.delete({
                where: {
                    id: id
                }
            }) : 
            null;
    }

    public async deleteAllMessages() : Promise<number> {
        const deleted = await this.prisma.message.deleteMany();
        return deleted.count;
    }

    /**
     * 
     * @param input 
     * @returns array of messages between 2 users with latest messages coming first 
     */
    public async getChat(input : GetChatInput) : Promise<Message[]> {
        return await this.prisma.message.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                userID: input.userID,
                                recepientID: input.withID
                            },
                            {
                                userID: input.withID,
                                recepientID: input.userID
                            }
                        ]
                    },
                    {
                        timestamp: {
                            lte: input.fromTime
                        }
                    }
                ] 
            },
            orderBy: {
                timestamp: "desc"
            },
            take: miscConstants.messagesLoadedInChat
        })
    }

    public async deleteChat(userID: string, withID: string) : Promise<number> {
        const deleted = await this.prisma.message.deleteMany({
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
        return deleted.count;
    }

    public async deleteAllChatsWithUser(userID: string) : Promise<number> {
        const deleted = await this.prisma.message.deleteMany({
            where: {
                OR: [
                    {userID: userID},
                    {recepientID: userID}
                ]
            }
        })
        return deleted.count;
    }

    public async getLatestMessageFromDistinctUsers(input : GetMatchesInput) {
        const [messagesFromUserID, messagesToUserID] = await Promise.all([
            this.prisma.message.findMany({
                where: {
                    userID: input.userID,
                    timestamp: {
                        lte: input.timestamp
                    }
                },
                orderBy: {
                    timestamp: "desc"
                },
                distinct: ["recepientID"],
                take: miscConstants.usersLoadedInPreview
            }),
            this.prisma.message.findMany({
                where: {
                    recepientID: input.userID,
                    timestamp: {
                        lte: input.timestamp
                    }
                },
                orderBy: {
                    timestamp: "desc"
                },
                distinct: ["userID"],
                take: miscConstants.usersLoadedInPreview
            })
        ]);

        return {messagesFromUserID, messagesToUserID};
    }

    public async createSample() {
        await this.prisma.message.deleteMany({
            where: {
                OR: [
                    {
                        userID: sampleContent.userID
                    },
                    {
                        recepientID: sampleContent.userID
                    }
                ]
            }
        })
        const chat1 : MessageInput[] = sampleContent.messages.map( (val,index) => 
            ({
                userID: "oldmatch1",
                recepientID: sampleContent.userID,
                message: val
            })
        )
        const chat2: MessageInput[] = [
            {
                userID: sampleContent.userID,
                recepientID: "oldmatch2",
                message: "hi"
            },
            {
                userID: "oldmatch2",
                recepientID: sampleContent.userID,
                message: "hello",
            }
        ]
        const allChats = chat1.concat(chat2);
        await Promise.all(allChats.map( (val,index) => 
            this.sendMessage(val, new Date(index))
        ))
    }
}