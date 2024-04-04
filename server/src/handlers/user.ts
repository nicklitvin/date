import { PrismaClient, User } from "@prisma/client";
import { EditUserInput, EloAction, EloUpdateInput, GetProfileListInput, ImageElement, ImageHandler, Preferences, PublicProfile, RequestUserInput, SettingData, SubscriptionData, UserInput } from "../interfaces";
import { addMonths, differenceInYears } from "date-fns";
import { globals } from "../globals";
import { sampleUsers } from "../sample";

export class UserHandler {
    private prisma : PrismaClient;
    private imageHandler: ImageHandler|undefined;

    constructor(prisma : PrismaClient, imageHandler?: ImageHandler) {
        this.prisma = prisma;
        this.imageHandler = imageHandler;
    }

    public isSchoolEmailValid(email : string) : boolean {
        return email.endsWith(".edu") || email == globals.sampleEmail;
    }

    public getUniversityFromEmail(email : string) : string {
        return email.split("@")[1].split(".edu")[0];
    }

    public async createUser(input : UserInput) : Promise<User> {
        return this.prisma.user.create({
            data: {
                ...input,
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
        const data = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        });
        return data ? this.convertUserToPublicProfile(data) : null
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
            differenceInYears(new Date(), input.birthday) >= globals.minAge &&
            differenceInYears(new Date(), input.birthday) <= globals.maxAge &&
            input.ageInterest.length == 2 &&
            input.ageInterest[0] < input.ageInterest[1] &&
            input.ageInterest[0] >= globals.minAge && 
            input.name.length <= globals.maxNameLength &&
            input.genderInterest.length <= globals.maxInterestedIn &&
            input.genderInterest.length == Array.from(
                new Set(input.genderInterest)).length &&
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

    public async updateElo(userID: string, eloChange: number) : Promise<User|null> {
        return await this.prisma.user.update({
            data: {
                elo: {
                    increment: eloChange
                }
            },
            where: {
                id: userID
            }
        })
    }

    public async getPublicProfilesFromCriteria(input : GetProfileListInput) : 
        Promise<PublicProfile[]> 
    {
        const users = await this.prisma.user.findMany({
            where: {
                id: {
                    in: input.include,
                    notIn: input.exclude
                },
                gender: {
                    in: input.gender
                },
                birthday: {
                    lte: input.maxDate,
                    gt: input.minDate
                }
            },
            orderBy: {
                elo: "desc"
            },
            take: input.count
        })
        const profiles = await Promise.all(
            users.map( user => this.convertUserToPublicProfile(user))
        )
        return profiles;
    }

    public async convertUserToPublicProfile(input : User) : Promise<PublicProfile> {
        const age = differenceInYears(new Date(), input.birthday);
        let imageElements : ImageElement[] = [];

        if (this.imageHandler) {
            imageElements = await Promise.all(
                input.images.map( async (imageID) => ({
                    id: imageID!,
                    url: (await this.imageHandler!.getImageURL(imageID))!
                }))
            )
        }

        return {
            id: input.id,
            name: input.name,
            age: age,
            attributes: input.attributes,
            description: input.description,
            gender: input.gender,
            images: imageElements,
            alcohol: input.alcohol,
            smoking: input.smoking
        }
    }

    public async getPreferences(userID: string) : Promise<Preferences|null> {
        const data = await this.prisma.user.findUnique({
            where: {
                id: userID
            }
        })
        if (!data) return null;

        return {
            agePreference: data.ageInterest as [number,number],
            genderPreference: data.genderInterest
        }
    }

    public async getSettings(userID : string) : Promise<SettingData[]|null> {
        const data = await this.prisma.user.findUnique({
            where: {
                id: userID
            }
        })

        if (!data) return null;

        return [
            {
                title: globals.notificationSetting,
                value: data.notifications
            }
        ]
    }

    public async getSubscriptionData(userID: string) : Promise<SubscriptionData|null> {
        const data = await this.prisma.user.findUnique({
            where: {
                id: userID
            }
        })
        if (!data) return null;
        return {
            subscribed: data.isSubscribed,
            endDate: data.subscribeEnd,
            ID: data.subscriptionID ?? undefined
        }
    }

    public async createSample() : Promise<User[]> {
        await this.prisma.user.deleteMany({
            where: {
                university: globals.sampleUniversity
            }
        })
        return await Promise.all(sampleUsers.map( val => 
            this.createUser(val)    
        ))
    }
}