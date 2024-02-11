import { PrismaClient, Verification } from "@prisma/client";
import { globals } from "../globals";
import { addMinutes } from "date-fns";
import { GetVerificationInput, MakeVerificationInput } from "../interfaces";

export class VerificationHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public generateDigitCode(digits = globals.verificationCodeLength) : number {
        const big = Math.pow(10, digits) - 1;
        const small = Math.pow(10,digits - 1);
        return Math.floor(Math.random() * (big - small + 1) + small);
    }

    public async makeVerificationEntry(input : MakeVerificationInput,
        customExpireTime = addMinutes(new Date(), globals.verificationExpireMinutes) 
        ) : Promise<number> 
    {
        return await this.prisma.verification.create({
            data: {
                email: input.email,
                userID: input.userID,
                code: this.generateDigitCode(),
                expires: customExpireTime,
                verified: false
            },
            select: {
                code: true
            }
        }).then(res => res.code);
    }

    public async getVerificationWithCode(input : GetVerificationInput) : 
        Promise<Verification|null> 
    {
        return await this.prisma.verification.findFirst({
            where: {
                email: input.email,
                userID: input.userID,
                code: input.code,
                expires: {
                    gte: new Date()
                }
            }
        })
    }

    public async verifyUser(email : string) : Promise<Verification|null> {
        return await this.prisma.verification.update({
            where: {
                email: email,
            },
            data: {
                verified: true
            }
        })
    }

    public async getVerificationByEmail(email: string) : Promise<Verification|null> {
        return await this.prisma.verification.findUnique({
            where: {
                email: email
            }
        })
    }

    public async getVerificationByUserID(userID: string) : Promise<Verification|null> {
        return await this.prisma.verification.findFirst({
            where: {
                userID: userID
            }
        })
    }

    public async regenerateVerificationCode(email : string, code : number) : 
        Promise<Verification> 
    {
        return await this.prisma.verification.update({
            data: {
                expires: addMinutes(new Date(), globals.verificationExpireMinutes),
                code: code
            },
            where: {
                email: email
            }
        })
    }

    public async removeExpiredVerifications() : Promise<number> {
        const deleted = await this.prisma.verification.deleteMany({
            where: {
                verified: false,
                expires: {
                    lt: new Date()
                }
            }
        });
        return deleted.count;
    }

    public async deleteVerification(email : string) : Promise<Verification|null> {
        return await this.prisma.verification.delete({
            where: {
                email: email
            }
        })
    }

    public async deleteAllVerifications() : Promise<number> {
        const deleted = await this.prisma.verification.deleteMany();
        return deleted.count;
    }
}