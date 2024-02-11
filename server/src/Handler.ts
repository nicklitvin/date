import { Message, PrismaClient, Swipe, User, UserReport } from "@prisma/client";
import { AnnouncementHandler } from "./handlers/announcement";
import { AttributeHandler } from "./handlers/attribute";
import { ErrorLogHandler } from "./handlers/errorlog";
import { UserHandler } from "./handlers/user";
import { S3ImageHandler } from "./handlers/images";
import { SwipeHandler } from "./handlers/swipe";
import { MessageHandler } from "./handlers/message";
import { ReportHandler } from "./handlers/report";
import { StripePaymentHandler } from "./handlers/pay";
import { ChatPreview, DeleteImageInput, EditUserInput, EloAction, GetChatPreviewsInput, ImageHandler, MessageInput, NewMatchInput, PaymentHandler, PublicProfile, RequestReportInput, RequestUserInput, SchoolColors, SubscribeInput, SwipeFeed, SwipeInput, UnlikeInput, UnlikeOutput, UploadImageInput, UserInput } from "./interfaces";
import { globals } from "./globals";
import { FreeTrialHandler } from "./handlers/freetrial";
import { VerificationHandler } from "./handlers/verification";

export class Handler {
    public announcement : AnnouncementHandler;
    public attribute : AttributeHandler;
    public errorLog : ErrorLogHandler;
    public user : UserHandler;
    public image : ImageHandler;
    public swipe : SwipeHandler;
    public message : MessageHandler;
    public report : ReportHandler;
    public pay : PaymentHandler;
    public freeTrial : FreeTrialHandler;
    public verification : VerificationHandler;

    constructor(prisma : PrismaClient, 
        customImageHandler : ImageHandler = new S3ImageHandler(),
        customPaymentHandler : PaymentHandler = new StripePaymentHandler()
    ) {
        this.image = customImageHandler,
        this.pay = customPaymentHandler;

        this.announcement = new AnnouncementHandler(prisma);
        this.attribute = new AttributeHandler(prisma);
        this.errorLog = new ErrorLogHandler(prisma);
        this.user = new UserHandler(prisma);
        this.swipe = new SwipeHandler(prisma);
        this.message = new MessageHandler(prisma);
        this.report = new ReportHandler(prisma);
        this.freeTrial = new FreeTrialHandler(prisma);
        this.verification = new VerificationHandler(prisma);
    }

    public async deleteEverything() {
        await Promise.all([
            this.announcement.deleteAllAnouncements(),
            this.attribute.deleteAllAttributes(),
            this.errorLog.deleteAllErrorLogs(),
            this.user.deleteAllUsers(),
            this.image.deleteAllImages(),
            this.swipe.deleteAllSwipes(),
            this.message.deleteAllMessages(),
            this.report.deleteAllReports(),
            this.freeTrial.deleteAllFreeTrialUsedUsers(),
            this.verification.deleteAllVerifications()
        ])
    }

    /**
     * 
     * @param user (images: string[] will be ignored in UserInput)
     * @param images 
     */
    public async createUser(input : RequestUserInput) : Promise<User|null> {
        if ( await this.user.getUserByEmail(input.email) || 
            !this.user.isInputValid(input) )
        {
            return null;
        }

        const imageIDs = await Promise.all(
            input.files.map( val => this.image.uploadImage(val))
        );

        const userInput : UserInput = {
            age: input.age,
            attributes: input.attributes,
            description: input.description,
            email: input.email, 
            gender: input.gender,
            ageInterest: input.ageInterest,
            genderInterest: input.genderInterest,
            name: input.name,
            images: imageIDs as string[]
        }

        return await this.user.createUser(userInput);
    }

    public async deleteUser(userID : string) {
        const foundUser = await this.user.getUserByID(userID);
        if (!foundUser) return null;

        const deleteAllUserImages = async () : Promise<number> => {
            const deleted = await Promise.all(
                foundUser.images.map(imageID => this.image.deleteImage(imageID)),
            )
            return deleted.length;
        }

        const [images, messages, user]= await Promise.all([
            deleteAllUserImages(),
            this.message.deleteAllChatsWithUser(foundUser.id),
            this.user.deleteUser(foundUser.id)
        ])
        return {images, messages, user};
    }

    public async makeSwipe(input : SwipeInput) : Promise<Swipe|null> {
        const [user, swipedUser, previousSwipe] = await Promise.all([
            this.user.getUserByID(input.userID),
            this.user.getUserByID(input.swipedUserID),
            this.swipe.getSwipeByUsers(input.userID, input.swipedUserID)
        ])

        if (!user || !swipedUser || user.id == swipedUser.id || previousSwipe) return null;

        const [swipe, _] = await Promise.all([
            this.swipe.createSwipe(input),
            this.user.updateElo(swipedUser.id, this.user.getEloChange({
                action: input.action == "Like" ? EloAction.Like : EloAction.Dislike,
                eloDiff: user.elo - swipedUser.elo,
                userElo: swipedUser.elo 
            }))
        ])

        return swipe;
    }

    public async sendMessage(input : MessageInput) : Promise<Message|null> {
        const [user, recepient, userOpinion, recepientOpinion] = await Promise.all([
            this.user.getUserByID(input.userID),
            this.user.getUserByID(input.recepientID),
            this.swipe.getSwipeByUsers(input.userID, input.recepientID),
            this.swipe.getSwipeByUsers(input.recepientID, input.userID)
        ])

        if (user && recepient && userOpinion?.action == "Like" && 
            recepientOpinion?.action == "Like"
        ) {
            const [message, _] = await Promise.all([
                this.message.sendMessage(input),
                this.user.updateElo(recepient.id, this.user.getEloChange({
                    action: EloAction.Message,
                    userElo: recepient.elo,
                    eloDiff: user.elo - recepient.elo
                }))
            ])
            return message
        }
        return null;
    }

    public async getChatPreviews(input : GetChatPreviewsInput) : 
        Promise<ChatPreview[]|null> 
    {
        const user = await this.user.getUserByID(input.userID);
        if (!user) return null;

        const messages = await this.message.getLatestMessagesFromDistinctUsers(input);
        const combined = messages.messagesFromUserID.concat(messages.messagesToUserID).
            sort( (a,b) => b.timestamp.getTime() - a.timestamp.getTime())

        const getChatPreview = async (message : Message) : Promise<ChatPreview|null> => {
            const [profile, messages] = await Promise.all([
                message.userID == input.userID ?
                    this.user.getPublicProfile(message.recepientID) :
                    this.user.getPublicProfile(message.userID),
                this.message.getChat({
                    userID: message.userID,
                    withID: message.recepientID,
                    fromTime: input.timestamp
                })
            ])
            if (profile && messages) return {profile, messages}
            return null;
        }
        
        const allChatPreviews = await Promise.all(combined.map(message => 
            getChatPreview(message)    
        ))
        const usedUserIDs = new Set<string>();
        const result : ChatPreview[] = [];

        for (const chatPreview of allChatPreviews) {
            if (result.length == globals.usersLoadedInPreview) break;

            if (chatPreview && !usedUserIDs.has(chatPreview.profile.id)) {
                usedUserIDs.add(chatPreview.profile.id);
                result.push(chatPreview);
            }
        }

        return result;
    }

    public async reportUser(input : RequestReportInput) : Promise<UserReport|null> {
        const [user, reportedUser] = await Promise.all([
            this.user.getUserByID(input.userID),
            this.user.getUserByID(input.reportedID),
        ])

        if (!(user && reportedUser) || user.id == reportedUser.id) return null;

        const [existingReport, reportCount] = await Promise.all([
            this.report.getReportByUsers(user.id, reportedUser.email),
            this.report.getReportCountForEmail(reportedUser.email)
        ])

        if (existingReport) return null;

        const swipe = await this.swipe.getSwipeByUsers(user.id, reportedUser.id);

        const [report] = await Promise.all([
            this.report.makeReport({
                userID: input.userID,
                reportedEmail: reportedUser.email
            }),
            swipe ? this.swipe.updateSwipe(swipe.id, "Dislike") : 
                this.swipe.createSwipe({
                    userID: input.userID, 
                    swipedUserID: input.reportedID,
                    action: "Dislike"
                }),
            this.message.deleteChat(user.id, reportedUser.id)
        ])

        if (reportCount == globals.maxReportCount) await this.deleteUser(reportedUser.id);

        return report
    }

    public async uploadImage(input : UploadImageInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);

        if (
            !user || 
            user.images.length == globals.maxImagesCount ||
            !globals.acceptaleImageFormats.includes(input.image.mimetype)
        ) return null;

        const imageID = await this.image.uploadImage(input.image);
        if (!imageID) return null;

        return await this.user.editUser({
            setting: "images",
            userID: input.userID,
            value: user.images.concat([imageID])
        })
    }

    public async deleteImage(input : DeleteImageInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);

        if (!user || !user.images.includes(input.imageID)) return null;

        return await this.user.editUser({
            setting: "images",
            userID: input.userID,
            value: user.images.filter( val => val != input.imageID)
        })
    }

    public async editUser(input : EditUserInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);

        if (!user || !globals.allowedAttributeEdits.includes(input.setting)) {
            return null;
        }

        return await this.user.editUser(input);
    }

    public async changeImageOrder(input : EditUserInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);

        if (!user || input.setting != "images") return null;

        try {
            const newOrder = input.value as string[];
            if (newOrder.length == user.images.length && 
                user.images.every( val => newOrder.includes(val))) 
            {
                return await this.user.editUser(input);
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    public async getSubscriptionCheckoutPage(userID: string) : Promise<string|null> {
        const user = await this.user.getUserByID(userID);
        if (!user) return null;

        const usedFreeTrial = await this.freeTrial.hasEmailUsedFreeTrial(user.email);
        return await this.pay.createSubscriptionSessionURL(userID, !usedFreeTrial);
    }

    public async processSubscriptionPay(input : SubscribeInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);
        if (!user) return null;

        await this.user.updateSubscriptionAfterPay(input.userID, input.subscriptionID)
        return await this.user.updateElo(input.userID, this.user.getEloChange({
            action: EloAction.Subscribe,
            eloDiff: globals.eloStart - user.elo,
            userElo: user.elo
        }))
    }

    public async cancelSubscription(userID: string) : Promise<User|null> {
        const user = await this.user.getUserByID(userID);

        if (!user || !user.subscriptionID) return null;

        if (await this.pay.cancelSubscription(user.subscriptionID)) {
            await this.user.cancelSubscription(userID)
            return await this.user.updateElo(userID, this.user.getEloChange({
                action: EloAction.Unsubscribe,
                eloDiff: globals.eloStart - user.elo,
                userElo: user.elo
            }))
        }
        return null;
    }

    public async unlike(input : UnlikeInput) : Promise<UnlikeOutput|null> {
        const [user, matchUser] = await Promise.all([
            this.user.getUserByID(input.userID),
            this.user.getUserByID(input.withID)
        ]);

        if (!user || !matchUser) return null;

        const swipe = await this.swipe.getSwipeByUsers(user.id, matchUser.id);

        if (!swipe || swipe.action == "Dislike") return null;

        const [newSwipe, messagesDeleted] = await Promise.all([
            this.swipe.updateSwipe(swipe.id, "Dislike"),
            this.message.deleteChat(user.id, matchUser.id)
        ])

        return {
            deletedMessages: messagesDeleted,
            newSwipe: newSwipe as Swipe
        };
    }

    public async getNewMatches(input : NewMatchInput) : Promise<PublicProfile[]|null> {
        const user = await this.user.getUserByID(input.userID);

        if (!user) return null;

        const matches = await this.swipe.getAllMatches(input.userID,input.fromTime);
        const messages = await Promise.all(matches.map( matchUserID => 
            this.message.getChat({
                userID: input.userID,
                fromTime: new Date(),
                withID: matchUserID
            })    
        ));

        const newMatches = matches.filter( 
            (_,index) => messages[index].length == 0
        ).slice(0,globals.usersLoadedInPreview);

        const publicProfiles = await Promise.all(
            newMatches.map( val => this.user.getPublicProfile(val))
        );
        const filteredProfiles = publicProfiles.filter(
            val => val != null
        ) as PublicProfile[];

        return filteredProfiles
    }

    public async getSwipeFeed(userID: string) : Promise<SwipeFeed|null> {
        const user = await this.user.getUserByID(userID);

        if (!user) return null;

        const [alreadySwipedIDs, likedMeUserIDs] = await Promise.all([
            this.swipe.getSwipedUsers(userID),
            this.swipe.getLikedMeUsers(userID)
        ]);

        const likedMeProfiles = await this.user.getPublicProfilesFromCriteria({
            include: likedMeUserIDs,
            count: globals.usersInSwipeFeed / 2,
            ageRange: user.ageInterest,
            gender: user.genderInterest
        });
        const likedMeProfileIDs = likedMeProfiles.map(val => val.id);

        const otherUsers = await this.user.getPublicProfilesFromCriteria({
            exclude: [...alreadySwipedIDs, userID, ...likedMeProfileIDs],
            count: globals.usersInSwipeFeed - likedMeProfiles.length,
            ageRange: user.ageInterest,
            gender: user.genderInterest
        });

        const combined = likedMeProfiles.concat(otherUsers).sort(
            (a,b) => a.id.localeCompare(b.id)
        );

        return {
            profiles: combined,
            likedMeIDs: likedMeProfileIDs          
        }
    }
}