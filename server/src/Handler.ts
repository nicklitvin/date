import { Message, PrismaClient, User, UserReport } from "@prisma/client";
import { AnnouncementHandler } from "./handlers/announcement";
import { AttributeHandler } from "./handlers/attribute";
import { ErrorLogHandler } from "./handlers/errorlog";
import { UserHandler } from "./handlers/user";
import { S3ImageHandler } from "./handlers/images";
import { SwipeHandler } from "./handlers/swipe";
import { MessageHandler } from "./handlers/message";
import { ReportHandler } from "./handlers/report";
import { PaymentHandler } from "./handlers/pay";
import { ChatPreview, DeleteImageInput, GetChatPreviewsInput, ImageHandler, MessageInput, RequestReportInput, RequestUserInput, SwipeInput, UploadImageInput, UserInput } from "./interfaces";
import { globals } from "./globals";

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

    constructor(prisma : PrismaClient, 
        customImageHandler : ImageHandler = new S3ImageHandler) 
    {
        this.image = customImageHandler,

        this.announcement = new AnnouncementHandler(prisma);
        this.attribute = new AttributeHandler(prisma);
        this.errorLog = new ErrorLogHandler(prisma);
        this.user = new UserHandler(prisma);
        this.swipe = new SwipeHandler(prisma);
        this.message = new MessageHandler(prisma);
        this.report = new ReportHandler(prisma);
        this.pay = new PaymentHandler();
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
            this.report.deleteAllReports()
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
            interestedIn: input.interestedIn,
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

    public async makeSwipe(input : SwipeInput) : Promise<SwipeInput|null> {
        const [user, swipedUser, previousSwipe] = await Promise.all([
            this.user.getUserByID(input.userID),
            this.user.getUserByID(input.swipedUserID),
            this.swipe.getSwipeByUsers(input.userID, input.swipedUserID)
        ])

        if (!user || !swipedUser || user.id == swipedUser.id || previousSwipe) return null;

        return await this.swipe.createSwipe(input);
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
            return await this.message.sendMessage(input);
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

        const report = await this.report.makeReport({
            userID: input.userID,
            reportedEmail: reportedUser.email
        });

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
}