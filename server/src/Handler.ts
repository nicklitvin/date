import { AttributeType, Message, Prisma, PrismaClient, Swipe, User, UserReport, Verification } from "@prisma/client";
import { AnnouncementHandler } from "./handlers/announcement";
import { AttributeHandler } from "./handlers/attribute";
import { ErrorLogHandler } from "./handlers/errorlog";
import { UserHandler } from "./handlers/user";
import { S3ImageHandler } from "./handlers/images";
import { SwipeHandler } from "./handlers/swipe";
import { MessageHandler } from "./handlers/message";
import { ReportHandler } from "./handlers/report";
import { StripePaymentHandler } from "./handlers/pay";
import { AttributeValueInput, ChatPreview, ConfirmVerificationInput, DeleteImageInput, EditUserInput, EloAction, GetMatchesInput, ImageHandler, LoginInput, LoginOutput, MessageInput, NewMatchData,NewVerificationInput, PaymentHandler,UserReportWithReportedID, SubscribeInput, SubscriptionData, SwipeFeed, SwipeInput, UnlikeInput, UnlikeOutput, UploadImageInput, UserInput, UserInputWithFiles, UserSwipeStats, WithEmail, MailHandler, ReadStatusInput } from "./interfaces";
import { FreeTrialHandler } from "./handlers/freetrial";
import { VerificationHandler } from "./handlers/verification";
import { addYears } from "date-fns";
import { allowedAttributeEdits, attributeList } from "./others";
import { LoginHandler } from "./handlers/login";
import { NotificationHandler } from "./handlers/notification";
import { eloConstants, miscConstants, sampleContent, userRestrictions, userSettings } from "./globals";
import { GmailHandler } from "./handlers/mail";

interface Props {
    prisma: PrismaClient
    ignoreVerificaton?: boolean
    disableNotifications?: boolean
    imageHandler?: ImageHandler
    paymentHandler?: PaymentHandler
    mailHandler?: MailHandler
} 

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
    public login : LoginHandler;
    public notification : NotificationHandler;
    public mail : MailHandler;

    private ignoreVerification : boolean;
    private disableNotifications : boolean;

    constructor(props : Props) {
        this.image = props.imageHandler ?? new S3ImageHandler()
        this.pay = props.paymentHandler ?? new StripePaymentHandler()
        this.mail = props.mailHandler ?? new GmailHandler()
        this.ignoreVerification = props.ignoreVerificaton ?? false
        this.disableNotifications = props.disableNotifications ?? false

        this.announcement = new AnnouncementHandler(props.prisma);
        this.attribute = new AttributeHandler(props.prisma);
        this.errorLog = new ErrorLogHandler(props.prisma);
        this.user = new UserHandler(props.prisma, this.image);
        this.swipe = new SwipeHandler(props.prisma);
        this.message = new MessageHandler(props.prisma);
        this.report = new ReportHandler(props.prisma);
        this.freeTrial = new FreeTrialHandler(props.prisma);
        this.verification = new VerificationHandler(props.prisma);
        this.login = new LoginHandler(props.prisma);
        this.notification = new NotificationHandler()
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
            this.verification.deleteAllVerifications(),
            this.login.deleteAllLogin(),
            this.mail.clearVerificationCount()
        ])
    }

    public async createUser(input : UserInputWithFiles & WithEmail, 
        ignoreVerification = this.ignoreVerification) : Promise<User|null> 
    {
        const [user, verification] = await Promise.all([
            this.user.getUserByEmail(input.email),
            this.verification.getVerificationByPersonalEmail(input.email)
        ])
        if (user || !this.user.isInputValid(input)) return null;

        if ( (verification && verification.verified) || ignoreVerification) {
            const imageIDs = await Promise.all(
                input.files.map( val => {
                    const decoded = Buffer.from(val.content,"base64")
                    return this.image.uploadImage({
                        buffer: decoded,
                        mimetype: val.mimetype
                    })
                })
            );
    
            const userInput : UserInput = {
                id: input.id,
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
            if (!this.disableNotifications) {
                const recepientLogin = await this.login.getUserByEmail(recepient.email);
                if (recepientLogin?.expoPushToken) {
                    await this.notification.newMessage({
                        fromName: user.name,
                        message: message,
                        recepientPushToken: recepientLogin?.expoPushToken
                    })
                }
            }
            return message
        }
        return null;
    }

    public async getChatPreviews(input : GetMatchesInput) : 
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
            if (result.length == miscConstants.usersLoadedInPreview) break;

            if (chatPreview && !usedUserIDs.has(chatPreview.profile.id)) {
                usedUserIDs.add(chatPreview.profile.id);
                result.push(chatPreview);
            }
        }

        return result;
    }

    public async reportUser(input : UserReportWithReportedID) : Promise<UserReport|null> {
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

        if (reportCount == miscConstants.maxReportCount) {
            await this.deleteUser(reportedUser.id);
        }

        return report
    }

    public async uploadImage(input : UploadImageInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);

        if (
            !user || 
            user.images.length == userRestrictions.maxImagesCount ||
            !userRestrictions.acceptaleImageFormats.includes(input.image.mimetype)
        ) return null;

        const imageID = await this.image.uploadImage({
            buffer: Buffer.from(input.image.content, "base64"),
            mimetype: input.image.mimetype
        });
        if (!imageID) return null;

        return await this.user.editUser({
            setting: userSettings.image,
            userID: input.userID,
            value: user.images.concat([imageID])
        })
    }

    public async deleteImage(input : DeleteImageInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);

        if (!user || !user.images.includes(input.imageID) || user.images.length == 1) return null;

        return await this.user.editUser({
            setting: userSettings.image,
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

        if (!user || input.setting != userSettings.image) return null;

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
        return await this.pay.createSubscriptionSessionURL(userID, user.email, !usedFreeTrial);
    }

    public async processSubscriptionPay(input : SubscribeInput) : Promise<User|null> {
        const user = await this.user.getUserByID(input.userID);
        if (!user) return null;

        await this.user.updateSubscriptionAfterPay(input.userID, input.subscriptionID)
        return await this.user.updateElo(input.userID, this.user.getEloChange({
            action: EloAction.Subscribe,
            eloDiff: eloConstants.start - user.elo,
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
                eloDiff: eloConstants.start - user.elo,
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

    public async getNewMatches(input : GetMatchesInput) : Promise<NewMatchData[]|null> {
        const user = await this.user.getUserByID(input.userID);

        if (!user) return null;

        const matches = await this.swipe.getAllMatches(input.userID,input.timestamp);
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
            slice(0, miscConstants.usersLoadedInPreview).
            map( val => ({profile: val.profile!, timestamp: val.timestamp}))
    }

    public async getSwipeFeed(userID: string) : Promise<SwipeFeed|null> {
        const user = await this.user.getUserByID(userID);

        if (!user) return null;

        const [alreadySwipedIDs, likedMeUserIDs] = await Promise.all([
            this.swipe.getSwipedUsers(userID),
            this.swipe.getLikedMeUsers(userID),
        ]);

        const minDate = addYears(new Date(), -(user.ageInterest[1] + 1));
        const maxDate = addYears(new Date(), -user.ageInterest[0]);

        const likedMeProfiles = await this.user.getPublicProfilesFromCriteria({
            include: likedMeUserIDs,
            exclude: alreadySwipedIDs,
            count: miscConstants.usersInSwipeFeed / 2,
            gender: user.genderInterest,
            minDate: minDate,
            maxDate: maxDate
        });
        const likedMeProfileIDs = likedMeProfiles.map(val => val.id);
        const excludeList = Array.from(new Set([...alreadySwipedIDs, userID, ...likedMeProfileIDs]));

        const otherUsers = await this.user.getPublicProfilesFromCriteria({
            exclude: excludeList,
            count: miscConstants.usersInSwipeFeed - likedMeProfiles.length,
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

    public async getVerificationCode(input : NewVerificationInput & WithEmail) : 
        Promise<number|null> 
    {
        await this.verification.removeExpiredVerifications();

        const [schoolValid, personalTaken, schoolTaken] = await Promise.all([
            this.user.isSchoolEmailValid(input.schoolEmail),
            this.verification.getVerificationByPersonalEmail(input.email),
            this.verification.getVerificationBySchoolEmail(input.schoolEmail)
        ]);

        if (!schoolValid || schoolTaken || personalTaken) return null;

        const code = input.email == sampleContent.email ?
            await this.verification.makeVerificationEntry(input, new Date(2100,1,1), sampleContent.code) :
            await this.verification.makeVerificationEntry(input)

        await this.mail.sendVerificationCode(input.schoolEmail, code);
        return code;
    }

    public async verifyUserWithCode(input : ConfirmVerificationInput & WithEmail) : 
        Promise<Verification|null> 
    {
        return await this.verification.getVerificationWithCode(input) ? 
            await this.verification.verifyUser(input.schoolEmail) :
            null;
    }

    public async regenerateVerificationCode(eduEemail : string) : Promise<number|null> {
        const verification = await this.verification.getVerificationBySchoolEmail(eduEemail);
        if (!verification) return null;

        let newCode : number|undefined; 
        while (true) {
            if (eduEemail == sampleContent.eduEmail) {
                newCode = sampleContent.code;
                break;
            } else {
                newCode = this.verification.generateDigitCode();
                if (newCode != verification.code) break;
            }
        }
        const newVerification = await this.verification.regenerateVerificationCode(
            eduEemail, newCode
        );
        await this.mail.sendVerificationCode(eduEemail, newCode);
        return newVerification.code;
    }

    public async loginWithToken(input : LoginInput, customEmail? : string) : Promise<LoginOutput|null> {
        let email = customEmail ?? 
        (
            input.appleToken ? 
            await this.login.getEmailFromAppleToken(input.appleToken) : 
            (
                input.googleToken ? 
                await this.login.getEmailFromGoogleToken(input.googleToken) : 
                null
            )
        );
        
        if (!email) return null;

        if (await this.login.getUserByEmail(email)) {
            if (input.expoPushToken) {
                await this.login.updateExpoToken(email, input.expoPushToken);
            }
            const userLogin = await this.login.updateKey(email);
            const verification = await this.verification.getVerificationByPersonalEmail(email);
            return {
                key: userLogin.key,
                newAccount: await this.user.getUserByEmail(email) == null,
                verified: verification?.verified ?? false
            };
        } else {
            const userLogin = await this.login.createUser({
                email: email,
                expoPushToken: input.expoPushToken,
                customID: email == sampleContent.email ? sampleContent.userID : undefined
            });
            return {
                key: userLogin.key,
                newAccount: true,
                verified: false
            };
        }
    }

    public async autoLogin(key : string) : Promise<string|null> {
        const userLogin = await this.login.getUserByKey(key);
        
        if (userLogin &&  userLogin.expire.getTime() > new Date().getTime()) {
            await this.login.updateExpiration(userLogin.email);
            return key;
        } else {
            return null;
        }
    }

    public async createSample() : Promise<void> {
        await Promise.all([
            this.user.createSample(),
            this.swipe.createSample(),
            this.message.createSample(),
        ])
        const formattedList = Object.entries(attributeList).flatMap(([key, values]) =>
            values.map(value => [key, value])
        );
    
        const formattedListWithObjects : AttributeValueInput[] = formattedList.map(([key, value]) => ({
            type: key as AttributeType,
            value: value
        }));

        await Promise.all([
            formattedListWithObjects.map( val => this.attribute.addAttribute(val))
        ])
    }

    public async getStatsIfSubscribed(userID: string, customInfo? : SubscriptionData) : Promise<UserSwipeStats|null> {
        const subscriberInfo = customInfo ?? await this.user.getSubscriptionData(userID);
        if (
            subscriberInfo &&
            subscriberInfo.ID && 
            subscriberInfo.endDate &&
            subscriberInfo.endDate.getTime() > new Date().getTime() &&
            subscriberInfo.subscribed 
        ) {
            return await this.swipe.getUserSwipeStats(userID);
        }
        return null;
    }

    public async updateReadStatus(input : ReadStatusInput) : Promise<number|null> {
        const [user, recepient, userOpinion, recepientOpinion] = await Promise.all([
            this.user.getUserByID(input.userID),
            this.user.getUserByID(input.toID),
            this.swipe.getSwipeByUsers(input.userID, input.toID),
            this.swipe.getSwipeByUsers(input.toID, input.userID)
        ])

        if (user && recepient && userOpinion?.action == "Like" && 
            recepientOpinion?.action == "Like"
        ) {
            return await this.message.updateReadStatus({
                userID: input.userID,
                toID: input.toID,
                timestamp: input.timestamp
            })           
        }
        return null;
    }
}