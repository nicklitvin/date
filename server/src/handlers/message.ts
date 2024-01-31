import { Message, PrismaClient } from "@prisma/client";
import { GetChatInput, MessageInput, ReadStatusInput } from "../types";
import { randomUUID } from "crypto";

export class MessageHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async sendMessage(input : MessageInput) : Promise<Message> {
        return await this.prisma.message.create({
            data: {
                ...input,
                id: randomUUID(),
                readStatus: false,
                timestamp: new Date()
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
            take: input.count
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
}