import { Message, PrismaClient, User } from "@prisma/client";
import { AnnouncementHandler } from "./handlers/announcement";
import { AttributeHandler } from "./handlers/attribute";
import { ErrorLogHandler } from "./handlers/errorlog";
import { UserHandler } from "./handlers/user";
import { S3ImageHandler } from "./handlers/images";
import { SwipeHandler } from "./handlers/swipe";
import { MessageHandler } from "./handlers/message";
import { ReportHandler } from "./handlers/report";
import { PaymentHandler } from "./handlers/pay";
import { MessageInput, RequestUserInput, SwipeInput, UserInput } from "./types";

export class Handler {
    public announcement : AnnouncementHandler;
    public attribute : AttributeHandler;
    public errorLog : ErrorLogHandler;
    public user : UserHandler;
    public image : S3ImageHandler;
    public swipe : SwipeHandler;
    public message : MessageHandler;
    public report : ReportHandler;
    public pay : PaymentHandler;

    constructor(prisma : PrismaClient) {
        this.announcement = new AnnouncementHandler(prisma);
        this.attribute = new AttributeHandler(prisma);
        this.errorLog = new ErrorLogHandler(prisma);
        this.user = new UserHandler(prisma);
        this.image = new S3ImageHandler();
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
}