import { PrismaClient, UserReport } from "@prisma/client";
import { UserReportInput } from "../interfaces";
import { randomUUID } from "crypto";

export class ReportHandler {
    private prisma : PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    public async makeReport(input : UserReportInput) : Promise<UserReport> {
        return await this.prisma.userReport.create({
                data: {
                    ...input,
                    id: randomUUID(),
                    timestamp: new Date()
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
}