import { PrismaClient, User } from "@prisma/client";
import { EditUserInput, EloAction, EloUpdateInput, PublicProfile, RequestUserInput, UserInput } from "../interfaces";
import { randomUUID } from "crypto";
import { addMonths } from "date-fns";
import { globals } from "../globals";

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
                subscriptionID: null,
                elo: globals.eloStart
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

    public async updateSubscriptionAfterPay(userID : string, subscriptionID? : string) : 
        Promise<User> 
        {
        return await this.prisma.user.update({
            data: {
                subscribeEnd: addMonths(new Date(), 1),
                subscriptionID: subscriptionID,
                isSubscribed: true
            },
            where: {
                id: userID
            }
        })
    }

    public async cancelSubscription(userID : string) : Promise<User> {
        return await this.prisma.user.update({
            data: {
                isSubscribed: false,
                subscriptionID: null
            },
            where: {
                id: userID
            }
        })
    }

    public isInputValid(input : RequestUserInput) : boolean {
        return (
            input.age >= globals.minAge &&
            input.age <= globals.maxAge &&
            input.name.length <= globals.maxNameLength &&
            input.interestedIn.length <= globals.maxInterestedIn &&
            input.interestedIn.length == Array.from(new Set(input.interestedIn)).length &&
            input.attributes.length <= globals.maxAttributes && 
            input.attributes.length == Array.from(new Set(input.attributes)).length &&
            input.description.length <= globals.maxDescriptionLength && 
            input.files.length >= globals.minImagesCount &&
            input.files.length <= globals.maxImagesCount &&
            input.files.length == input.files.filter(val => 
                globals.acceptaleImageFormats.includes(val.mimetype)
            ).length
        )
    }

    public getEloChange(input : EloUpdateInput) : number {
        let change : number = 0;
        switch(input.action) {
            case (EloAction.Like): 
                change = globals.eloLikeMaxChange * 1 / (1 + Math.pow(10,
                    -input.eloDiff!/globals.eloDiffToMaxChange)
                );
                break;
            case (EloAction.Dislike):
                change = -globals.eloLikeMaxChange * 1 / (1 + Math.pow(10,
                    input.eloDiff!/globals.eloDiffToMaxChange)
                );
                break;
            case (EloAction.Message):
                change = globals.eloMessageMaxChange * 1 / (1 + Math.pow(10,
                    -input.eloDiff!/globals.eloDiffToMaxChange)
                );
                break;
            case (EloAction.Login):
                change = globals.eloMessageMaxChange * 1 / (1 + Math.pow(10,
                    -input.eloDiff!/globals.eloDiffToMaxChange)
                );
                break;
            case (EloAction.Subscribe):
                change = globals.eloSubscribeMaxChange * 1 / (1 + Math.pow(10,
                    input.eloDiff!/globals.eloDiffToMaxChange)
                );
                break;
            case (EloAction.Unsubscribe):
                change = -globals.eloSubscribeMaxChange * 1 / (1 + Math.pow(10,
                    -input.eloDiff!/globals.eloDiffToMaxChange)
                );
                break;
            
        }

        return change;
    }
}