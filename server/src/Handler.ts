import { PrismaClient } from "@prisma/client";
import { AnnouncementHandler } from "./handlers/announcement";
import { AttributeHandler } from "./handlers/attribute";
import { ErrorLogHandler } from "./handlers/errorlog";
import { UserHandler } from "./handlers/user";
import { S3ImageHandler } from "./handlers/images";
import { SwipeHandler } from "./handlers/swipe";
import { MessageHandler } from "./handlers/message";

export class Handler {
    public announcement : AnnouncementHandler;
    public attribute : AttributeHandler;
    public errorLog : ErrorLogHandler;
    public user : UserHandler;
    public image : S3ImageHandler;
    public swipe : SwipeHandler;
    public message : MessageHandler;

    constructor(prisma : PrismaClient) {
        this.announcement = new AnnouncementHandler(prisma);
        this.attribute = new AttributeHandler(prisma);
        this.errorLog = new ErrorLogHandler(prisma);
        this.user = new UserHandler(prisma);
        this.image = new S3ImageHandler();
        this.swipe = new SwipeHandler(prisma);
        this.message = new MessageHandler(prisma);
    }

    public async deleteEverything() {
        await Promise.all([
            this.announcement.deleteAllAnouncements(),
            this.attribute.deleteAllAttributes(),
            this.errorLog.deleteAllErrorLogs(),
            this.user.deleteAllUsers(),
            this.image.deleteAllImages(),
            this.swipe.deleteAllSwipes(),
            this.message.deleteAllMessages()
        ])
    }
}