import { Announcement, PrismaClient } from "@prisma/client";
import { AnnouncementInput } from "../interfaces";
import { randomUUID } from "crypto";

export class AnnouncementHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async makeAnnouncement(input : AnnouncementInput) : Promise<Announcement> {
        return await this.prisma.announcement.create({
            data: {
                ...input,
                id: randomUUID()
            }
        })
    }

    public async getCurrentAnnouncements() : Promise<Announcement[]> {
        return await this.prisma.announcement.findMany({
            where: {
                startTime: {
                    lte: new Date()
                },
                endTime: {
                    gte: new Date()
                }
            }
        });
    }

    public async getAllAnnouncements() : Promise<Announcement[]> {
        return await this.prisma.announcement.findMany();
    }

    public async deleteAnnouncement(id : string) : Promise<Announcement|null> {
        return await this.getAnnouncementByID(id) ?
            await this.prisma.announcement.delete({
                where: {
                    id: id
                }
            }) :
            null;
    }

    public async deleteAllAnouncements() : Promise<number> {
        const deleted = await this.prisma.announcement.deleteMany();
        return deleted.count;
    }

    public async getAnnouncementByID(id : string) : Promise<Announcement|null> {
        return await this.prisma.announcement.findUnique({
            where: {
                id: id
            }
        })
    }
}