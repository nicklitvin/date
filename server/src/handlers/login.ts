import { PrismaClient } from "@prisma/client";
import { globals } from "../globals";
import { addWeeks } from "date-fns";
import { randomUUID } from "crypto";
import axios from "axios";
import verifyAppleToken from "verify-apple-id-token";
import { LoginEntryInput } from "../interfaces";

export class LoginHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    async createUser(input : LoginEntryInput) {
        return await this.prisma.login.create({
            data: {
                email: input.email,
                expire: input.customDate ?? addWeeks(new Date(), globals.keyExpirationWeeks),
                key: randomUUID(),
                expoPushToken: input.expoPushToken 
            }
        })
    }

    async getUserByKey(key : string) {
        return await this.prisma.login.findFirst({
            where: {
                key: key
            }
        })
    }

    async getUserByEmail(email : string) {
        return await this.prisma.login.findUnique({
            where: {
                email: email
            }
        })
    }
    
    async updateKey(email : string) {
        return await this.prisma.login.update({
            where: {
                email: email
            },
            data: {
                key: randomUUID(),
                expire: addWeeks(new Date(), globals.keyExpirationWeeks)
            }
        })
    }

    async updateExpiration(email : string) {
        return await this.prisma.login.update({
            where: {
                email: email
            },
            data: {
                expire: addWeeks(new Date(), globals.keyExpirationWeeks)
            }
        })
    }

    async deleteAllLogin() {
        const deleted = await this.prisma.login.deleteMany();
        return deleted.count;
    }

    async deleteExpiredEntries() {
        const deleted = await this.prisma.login.deleteMany({
            where: {
                expire: {
                    lt: new Date()
                }
            }
        })
        return deleted.count;
    }   

    async getEmailFromGoogleToken(token : string) : Promise<string|null> {
        try {
            const response = await axios.get(globals.googleOAuth,{
                headers: {"Authorization": `Bearer ${token}`}
            })   
            return response.data.email as string;
        } catch (err) {
            return null
        }
    }

    async getEmailFromAppleToken(token : string) : Promise<string|null> {
        try {
            const jwtClaims = await verifyAppleToken({
              idToken: token,
              clientId: process.env.APPLE_CLIENT_ID as string, 
            });
            return jwtClaims.email;
        } catch (err) {
            return null;
        }
    }

    async updateExpoToken(email: string, token: string) {
        return await this.prisma.login.update({
            where: {
                email: email
            },
            data: {
                expoPushToken: token
            }
        })
    }
}