import { Announcement, AnnouncementViewed, PrismaClient } from "@prisma/client";
import { AnnouncementInput, ViewAnnouncementInput } from "../interfaces";
import { randomUUID } from "crypto";

export class AnnouncementHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async makeAnnouncement(input : AnnouncementInput) : Promise<Announcement> {
        await this.deleteExpiredAnnouncementsAndViews()

        return await this.prisma.announcement.create({
            data: {
                ...input,
                id: `announcement-${randomUUID()}`
            }
        })
    }

    public async viewAnnouncement(input : ViewAnnouncementInput) {
        return await this.prisma.announcementViewed.create({
            data: {
                id: `announcementView-${randomUUID()}`,
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

    public async deleteExpiredAnnouncementsAndViews() {
        const expired = await this.prisma.announcement.findMany({
            where: {
                endTime: {
                    lt: new Date()
                }
            }
        }).then( vals => vals.map( val => val.id));

        const deletedAnnouncements = await this.prisma.announcement.deleteMany({
            where: {
                endTime: {
                    lt: new Date()
                }
            }
        })

        const deletedViews = await this.prisma.announcementViewed.deleteMany({
            where: {
                announcementID: {
                    in: expired
                }
            }
        })

        return {
            announcements: deletedAnnouncements.count,
            views: deletedViews.count
        }
    }
}