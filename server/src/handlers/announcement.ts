import { Announcement, AnnouncementViewed, PrismaClient } from "@prisma/client";
import { AnnouncementInput, ViewAnnouncementInput } from "../interfaces";
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

    public async viewAnnouncement(input : ViewAnnouncementInput) {
        return await this.prisma.announcementViewed.create({
            data: {
                id: randomUUID(),
                announcementID: input.announcementID,
                userID: input.userID
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
            },
            orderBy: {
                startTime: "asc"
            }
        });
    }

    public async getViewedAnnouncements(userID?: string) : Promise<AnnouncementViewed[]> {
        return await this.prisma.announcementViewed.findMany({
            where: {
                userID: userID
            }
        })
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

    public async deleteAnnouncementViews() : Promise<number> {
        const deleted = await this.prisma.announcementViewed.deleteMany();
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