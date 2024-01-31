import { ErrorLog, PrismaClient } from "@prisma/client";
import { ErrorLogInput } from "../types";
import { randomUUID } from "crypto";

export class ErrorLogHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async recordErrorLog(input : ErrorLogInput, customTime : Date = new Date()) : 
        Promise<ErrorLog> 
    {
        return await this.prisma.errorLog.create({
            data: {
                ...input,
                id: randomUUID(),
                timestamp: customTime
            }
        })
    }

    public async getErrorLogs(count : number, fromTime : Date) : Promise<ErrorLog[]>{
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

    public async deleteAllErrorLogs() : Promise<number> {
        const deleted = await this.prisma.errorLog.deleteMany();
        return deleted.count;
    }
}