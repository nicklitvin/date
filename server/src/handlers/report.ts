import { PrismaClient, UserReport } from "@prisma/client";
import { UserReportInput } from "../interfaces";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";

export class ReportHandler {
    private prisma : PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async makeReport(input : UserReportInput, timestamp = new Date()) : Promise<UserReport> {
        return await this.prisma.userReport.create({
            data: {
                ...input,
                id: `report-${randomUUID()}`,
                timestamp: timestamp
            }
        });
    }

    public async getReportByUsers(userID : string, reportedEmail : string) : 
        Promise<UserReport|null> 
    {
        return await this.prisma.userReport.findFirst({
            where: {
                userID: userID,
                reportedEmail: reportedEmail
            }
        })
    }

    public async getReportCountForEmail(email : string) : Promise<number> {
        return await this.prisma.userReport.count({
            where: {
                reportedEmail: email
            }
        })
    }

    public async deleteAllReports() : Promise<number> {
        const deleted = await this.prisma.userReport.deleteMany();
        return deleted.count;
    }

    public async getReportsMadeCountForToday(userID : string) : Promise<number> {
        return await this.prisma.userReport.count({
            where: {
                userID: userID,
                timestamp: {
                    lte: new Date(),
                    gte: addDays(new Date(), -1)
                }
            }
        })
    }

    public async getReportCount() : Promise<number> {
        return await this.prisma.userReport.count();
    }
}