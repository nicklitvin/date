import { Message, PrismaClient, Swipe, User, UserReport, Verification } from "@prisma/client";
import { AnnouncementHandler } from "./handlers/announcement";
import { AttributeHandler } from "./handlers/attribute";
import { ErrorLogHandler } from "./handlers/errorlog";
import { UserHandler } from "./handlers/user";
import { S3ImageHandler } from "./handlers/images";
import { SwipeHandler } from "./handlers/swipe";
import { MessageHandler } from "./handlers/message";
import { ReportHandler } from "./handlers/report";
import { StripePaymentHandler } from "./handlers/pay";
import { ChatPreview, ConfirmVerificationInput, DeleteImageInput, EditUserInput, EloAction, GetChatPreviewsInput, ImageHandler, MessageInput, NewMatchData, NewMatchInput, NewVerificationInput, PaymentHandler, PublicProfile, RequestReportInput, RequestUserInput, SubscribeInput, SwipeFeed, SwipeInput, UnlikeInput, UnlikeOutput, UploadImageInput, UserInput } from "./interfaces";
import { globals } from "./globals";
import { FreeTrialHandler } from "./handlers/freetrial";
import { VerificationHandler } from "./handlers/verification";
import { addYears } from "date-fns";
import { allowedAttributeEdits } from "./others";

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

    private ignoreVerification : boolean;

    constructor(prisma : PrismaClient, ignoreVerification : boolean,
        customImageHandler : ImageHandler = new S3ImageHandler(),
        customPaymentHandler : PaymentHandler = new StripePaymentHandler(),
    ) {
        this.image = customImageHandler,
        this.pay = customPaymentHandler;
        this.ignoreVerification = ignoreVerification;

        this.announcement = new AnnouncementHandler(prisma);
        this.attribute = new AttributeHandler(prisma);
        this.errorLog = new ErrorLogHandler(prisma);
        this.user = new UserHandler(prisma, customImageHandler);
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

    public async createUser(input : RequestUserInput, 
        ignoreVerification = this.ignoreVerification) : Promise<User|null> 
    {
        const [user, verification] = await Promise.all([
            this.user.getUserByEmail(input.email),
            this.verification.getVerificationByPersonalEmail(input.email)
        ])
        if (user || !this.user.isInputValid(input)) return null;

        if (verification && verification.verified || ignoreVerification) {
            const imageIDs = await Promise.all(
                input.files.map( val => this.image.uploadImage(val))
            );
    
            const userInput : UserInput = {
                birthday: input.birthday,
                attributes: input.attributes,
                description: input.description,
                email: input.email, 
                gender: input.gender,
                ageInterest: input.ageInterest,
                genderInterest: input.genderInterest,
                name: input.name,
                images: imageIDs as string[],
                alcohol: input.alcohol,
                smoking: input.smoking,
            }
    
            return await this.user.createUser(userInput);
        }
        return null;
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

        const verification = await this.verification.getVerificationByPersonalEmail(
            foundUser.email
        );
        if (verification) {
            await this.verification.deleteVerification(verification!.schoolEmail)
        }

        const [images, messages, user]= await Promise.all([
            deleteAllUserImages(),
            this.message.deleteAllChatsWithUser(foundUser.id),
            this.user.deleteUser(foundUser.id),
        ])
        return {images, messages, user};
    }

    public async makeSwipe(input : SwipeInput) : Promise<Swipe|null> {
        const [user, swipedUser, previousSwipe] = await Promise.all([
            this.user.getUserByID(input.userID),
            this.user.getUserByID(input.swipedUserID),
            this.swipe.getSwipeByUsers(input.userID, input.swipedUserID)
        ])

        if (!user || !swipedUser || user.id == swipedUser.id || previousSwipe) {
            return null;
        }

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

        const messages = await this.message.getLatestMessageFromDistinctUsers(input);
        const combined = messages.messagesFromUserID.concat(messages.messagesToUserID).
            sort( (a,b) => b.timestamp.getTime() - a.timestamp.getTime())

        const getChatPreview = async (message : Message) : 
            Promise<ChatPreview|null> => 
        {
            const profile = await (
                message.userID == input.userID ?
                    this.user.getPublicProfile(message.recepientID) :
                    this.user.getPublicProfile(message.userID)
            )
            if (profile) return {profile, message}
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

        if (reportCount == globals.maxReportCount) {
            await this.deleteUser(reportedUser.id);
        }

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

        if (!user || !allowedAttributeEdits.includes(input.setting)) {
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

    public async getNewMatches(input : NewMatchInput) : Promise<NewMatchData[]|null> {
        const user = await this.user.getUserByID(input.userID);

        if (!user) return null;

        const matches = await this.swipe.getAllMatches(input.userID,input.fromTime);
        const data = await Promise.all(matches.map( async (match) => ({
            chat: await this.message.getChat({
                userID: input.userID,
                fromTime: new Date(),
                withID: match.userID
            }),
            profile: await this.user.getPublicProfile(match.userID),
            timestamp: match.timestamp
        })));

        return data.
            filter( (_,index) => data[index].chat.length == 0).
            slice(0, globals.usersLoadedInPreview).
            map( val => ({profile: val.profile!, timestamp: val.timestamp}))
    }

    public async getSwipeFeed(userID: string) : Promise<SwipeFeed|null> {
        const user = await this.user.getUserByID(userID);

        if (!user) return null;

        const [alreadySwipedIDs, likedMeUserIDs] = await Promise.all([
            this.swipe.getSwipedUsers(userID),
            this.swipe.getLikedMeUsers(userID)
        ]);

        const minDate = addYears(new Date(), -(user.ageInterest[1] + 1));
        const maxDate = addYears(new Date(), -user.ageInterest[0]);

        const likedMeProfiles = await this.user.getPublicProfilesFromCriteria({
            include: likedMeUserIDs,
            count: globals.usersInSwipeFeed / 2,
            gender: user.genderInterest,
            minDate: minDate,
            maxDate: maxDate
        });
        const likedMeProfileIDs = likedMeProfiles.map(val => val.id);

        const otherUsers = await this.user.getPublicProfilesFromCriteria({
            exclude: [...alreadySwipedIDs, userID, ...likedMeProfileIDs],
            count: globals.usersInSwipeFeed - likedMeProfiles.length,
            maxDate: maxDate,
            minDate: minDate,
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

    public async getVerificationCode(input : NewVerificationInput) : 
        Promise<number|null> 
    {
        await this.verification.removeExpiredVerifications();

        const [schoolValid, personalTaken, schoolTaken] = await Promise.all([
            this.user.isSchoolEmailValid(input.schoolEmail),
            this.verification.getVerificationByPersonalEmail(input.personalEmail),
            this.verification.getVerificationBySchoolEmail(input.schoolEmail)
        ]);

        if (!schoolValid || schoolTaken || personalTaken) return null;

        return await this.verification.makeVerificationEntry(input);
    }

    public async verifyUserWithCode(input : ConfirmVerificationInput) : 
        Promise<Verification|null> 
    {
        return await this.verification.getVerificationWithCode(input) ? 
            await this.verification.verifyUser(input.schoolEmail) :
            null;
    }

    public async regenerateVerificationCode(email : string) : Promise<number|null> {
        const verification = await this.verification.getVerificationBySchoolEmail(
            email
        );
        if (!verification) return null;

        let newCode : number|undefined; 
        while (true) {
            newCode = this.verification.generateDigitCode();
            if (newCode != verification.code) break;
        }
        const newVerification = await this.verification.regenerateVerificationCode(
            email, newCode
        );
        return newVerification.code;
    }
}