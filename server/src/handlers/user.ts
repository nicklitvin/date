import { PrismaClient, User } from "@prisma/client";
import { EditUserInput, EditUserSubscriptionInput, PublicProfile, UserInput } from "../types";
import { randomUUID } from "crypto";

export class UserHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public isEmailValid(email : string) : boolean {
        return email.endsWith(".edu");
    }

    public getUniversityFromEmail(email : string) : string {
        return email.split("@")[1].split(".edu")[0];
    }

    public async createUser(input : UserInput) : Promise<User> {
        return this.prisma.user.create({
            data: {
                ...input,
                id: randomUUID(),
                notifications: true,
                university: this.getUniversityFromEmail(input.email),
                subscribeEnd: new Date(),
                isSubscribed: false,
                subscriptionID: null
            }
        })
    }

    public async getUserByID(id : string) : Promise<User|null> {
        return await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })
    }

    public async getUserByEmail(email : string) : Promise<User|null> {
        return await this.prisma.user.findFirst({
            where: {
                email: email
            }
        })
    }

    public async getPublicProfile(id : string) : Promise<PublicProfile|null> {
        return await this.prisma.user.findUnique({
            where: {
                id: id
            }, select: {
                id: true,
                name: true,
                age: true,
                gender: true,
                attributes: true,
                images: true,
                description: true,
                university: true
            }
        });
    }

    public async deleteUser(id : string) : Promise<User|null> {
        return await this.getUserByID(id) ?
            await this.prisma.user.delete({
                where: {
                    id: id
                }
            }) :
            null;
    }

    public async deleteAllUsers() : Promise<number> {
        const deleted = await this.prisma.user.deleteMany();
        return deleted.count;
    }

    public async editUser(input : EditUserInput) : Promise<User|null> {
        try {
            return await this.prisma.user.update({
                data: {
                    [input.setting]: input.value
                },
                where: {
                    id: input.userID
                }
            })
        } catch (err) {
            return null;
        }
    }

    public async updateSubscriptionStatus(input : EditUserSubscriptionInput) {
        return await this.prisma.user.update({
            data: {
                subscribeEnd: input.subscribeEnd,
                isSubscribed: input.isSubscribed,
                subscriptionID: input.subscriptionID
            },
            where: {
                id: input.userID
            }
        })
    }
}