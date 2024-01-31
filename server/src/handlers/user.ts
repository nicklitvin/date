import { PrismaClient, User } from "@prisma/client";
import { AllowedUserEdits, EditUserInput, PublicProfile, UserInput } from "../types";
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

    public async createUser(input : UserInput) : Promise<User|null> {
        const user = await this.getUserByEmail(input.email);

        if (user) return null;
        if (!this.isEmailValid(input.email)) return null;
        
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
        const user = await this.prisma.user.findUnique({
            where: {
                id: input.userID
            }
        });

        if (user && AllowedUserEdits.includes(input.setting)) {
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
        } else {
            return null;
        }
    }

    // public async deleteUser(userID : string) : Promise<UserDelete> {
    //     const user = await this.prisma.getUser(userID);
    //     if (user) {
    //         const promises = user.images.map( async (imageID) => 
    //             await deleteImage(imageID)
    //         );
    //         await Promise.all(promises)
    //         return await this.prisma.deleteUser(userID)
    //     } else {
    //         return {
    //             messages: 0,
    //             swipes: 0,
    //             user: 0
    //         };
    //     }
    // }
    
    // public async createUser(user : User, images: FileUpload[] = [], 
    //     maxImageCount : number = maxProfileImageCount) : Promise<User|null> 
    // {
    //     if (await this.prisma.getUser(user.id)) {
    //         return null;
    //     } else if (doesUniversityMatchEmail(user)) {
    //         await Promise.all(images.map( async (image, index) => {
    //             if (index < maxImageCount) {
    //                 try {
    //                     const imageID = await uploadImage(image.buffer, image.mimetype);
    //                     if (imageID) {
    //                         user.images.push(imageID);
    //                     }
    //                 } catch (err) {}
    //             } 
    //         }))

    //         return await this.prisma.createUser(user);
    //     } else {
    //         return null;
    //     }
    // }

    // public async getProfile(userID : string) : Promise<User|null> {
    //     return await this.prisma.getUser(userID);
    // }

    // public async editUser(userID : string, setting: (keyof User), value : any) : 
    //     Promise<User|null>
    // {
    //     try {
    //         return await this.prisma.editUser(userID, setting, value);
    //     } catch (err) {
    //         return null;
    //     }
    // }

    // public async getPublicProfile(userID : string) : Promise<PublicProfile|null> {
    //     return await this.prisma.getPublicProfile(userID);
    // }

    // public async createUser(user : User) {
    //     return await this.prisma.user.create({ data: user })
    // }
    
    // public async deleteUser(userID : string) : Promise<UserDelete> {
    //     const transaction = await this.prisma.$transaction([
    //         this.prisma.user.deleteMany({
    //             where: {
    //                 id: userID
    //             }
    //         }),
    //         this.prisma.swipe.deleteMany({
    //             where: {
    //                 OR: [
    //                     {
    //                         userID: userID 
    //                     },
    //                     {
    //                         swipedUserID: userID
    //                     }
    //                 ]
    //             }
    //         }),
    //         this.prisma.message.deleteMany({
    //             where: {
    //                 userID: userID
    //             }
    //         })
    //     ])
    //     return {
    //         user: transaction[0].count,
    //         swipes: transaction[1].count,
    //         messages: transaction[2].count
    //     }
    // }

    // public async getUser(userID : string) : Promise<User|null> {
    //     return await this.prisma.user.findUnique({
    //         where: {
    //             id: userID
    //         }
    //     });
    // }

    // public async editUser(userID : string, setting : (keyof User), value : any) : 
    //     Promise<User> 
    // {
    //     return await this.prisma.user.update({
    //         where: {
    //             id: userID
    //         },
    //         data: {
    //             [setting]: value
    //         }
    //     })
    // }
}