import { PrismaClient } from "@prisma/client";
import { AnnouncementHandler } from "./handlers/announcement";
import { AttributeHandler } from "./handlers/attribute";
import { ErrorLogHandler } from "./handlers/errorlog";
import { UserHandler } from "./handlers/user";
import { S3ImageHandler } from "./handlers/images";

export class Handler {
    public announcement : AnnouncementHandler;
    public attribute : AttributeHandler;
    public errorLog : ErrorLogHandler;
    public user : UserHandler;

    public image : S3ImageHandler;

    constructor(prisma : PrismaClient) {
        this.announcement = new AnnouncementHandler(prisma);
        this.attribute = new AttributeHandler(prisma);
        this.errorLog = new ErrorLogHandler(prisma);
        this.user = new UserHandler(prisma);
        this.image = new S3ImageHandler();
    }

    public async deleteEverything() {
        await Promise.all([
            this.announcement.deleteAllAnouncements(),
            this.attribute.deleteAllAttributes(),
            this.errorLog.deleteAllErrorLogs(),
            this.image.deleteAllImages()
        ])
    }
}