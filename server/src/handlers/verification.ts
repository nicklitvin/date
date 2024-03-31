import { PrismaClient, Verification } from "@prisma/client";
import { globals } from "../globals";
import { addMinutes } from "date-fns";
import { NewVerificationInput, ConfirmVerificationInput} from "../interfaces";

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

    public async makeVerificationEntry(input : NewVerificationInput,
        customExpireTime = addMinutes(new Date(), globals.verificationExpireMinutes),
        code = this.generateDigitCode()
        ) : Promise<number> 
    {
        return await this.prisma.verification.create({
            data: {
                schoolEmail: input.schoolEmail,
                personalEmail: input.personalEmail,
                code: code,
                expires: customExpireTime,
                verified: false
            },
            select: {
                code: true
            }
        }).then(res => res.code);
    }

    public async getVerificationWithCode(input : ConfirmVerificationInput) : 
        Promise<Verification|null> 
    {
        return await this.prisma.verification.findFirst({
            where: {
                personalEmail: input.personalEmail,
                schoolEmail: input.schoolEmail,
                code: input.code,
                expires: {
                    gte: new Date()
                }
            }
        })
    }

    public async verifyUser(schoolEmail : string) : Promise<Verification|null> {
        return await this.prisma.verification.update({
            where: {
                schoolEmail: schoolEmail,
            },
            data: {
                verified: true
            }
        })
    }

    public async getVerificationBySchoolEmail(email: string) : Promise<Verification|null> {
        return await this.prisma.verification.findUnique({
            where: {
                schoolEmail: email
            }
        })
    }

    public async getVerificationByPersonalEmail(email: string) : Promise<Verification|null> {
        return await this.prisma.verification.findFirst({
            where: {
                personalEmail: email
            }
        })
    }

    public async regenerateVerificationCode(schoolEmail : string, code : number) : 
        Promise<Verification> 
    {
        return await this.prisma.verification.update({
            data: {
                expires: addMinutes(new Date(), globals.verificationExpireMinutes),
                code: code
            },
            where: {
                schoolEmail: schoolEmail
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

    public async deleteVerification(schoolEmail : string) : Promise<Verification|null> {
        return await this.prisma.verification.delete({
            where: {
                schoolEmail: schoolEmail
            }
        })
    }

    public async deleteAllVerifications() : Promise<number> {
        const deleted = await this.prisma.verification.deleteMany();
        return deleted.count;
    }

    public async getVerificationCount() : Promise<number> {
        return await this.prisma.verification.count();
    }
}