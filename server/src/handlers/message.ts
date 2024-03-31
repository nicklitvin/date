import { Message, PrismaClient } from "@prisma/client";
import { GetChatInput, GetChatPreviewsInput, MessageInput, ReadStatusInput } from "../interfaces";
import { randomUUID } from "crypto";
import { globals } from "../globals";

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
                userID: input.fromID,
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
            take: globals.messagesLoadedInChat
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

    public async getLatestMessageFromDistinctUsers(input : GetChatPreviewsInput) {
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
                take: globals.usersLoadedInPreview
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
                take: globals.usersLoadedInPreview
            })
        ]);

        return {messagesFromUserID, messagesToUserID};
    }

    public async createSample() {
        await this.prisma.message.deleteMany({
            where: {
                OR: [
                    {
                        userID: globals.sampleUserID
                    },
                    {
                        recepientID: globals.sampleUserID
                    }
                ]
            }
        })
        const chat1 : MessageInput[] = globals.sampleMessages.map( (val,index) => 
            ({
                userID: "oldmatch1",
                recepientID: globals.sampleUserID,
                message: val
            })
        )
        const chat2: MessageInput[] = [
            {
                userID: globals.sampleUserID,
                recepientID: "oldmatch2",
                message: "hi"
            },
            {
                userID: "oldmatch2",
                recepientID: globals.sampleUserID,
                message: "hello",
            }
        ]
        const allChats = chat1.concat(chat2);
        await Promise.all(allChats.map(val => 
            this.sendMessage(val)
        ))
    }
}