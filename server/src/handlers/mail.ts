import { createTransport, Transporter} from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";
import { MailHandler } from "../abstracts";

export class GmailHandler extends MailHandler {
    private transport : Transporter<SMTPTransport.SentMessageInfo>;

    constructor() {
        super();
        dotenv.config();
        
        this.transport = createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: false,
            auth: {
              user: process.env.GMAIL,
              pass: process.env.GMAIL_APP_PASS,
            },
        })
    }

    async sendVerificationCode(email : string, code : number) : Promise<any|null>{
        try {
            const transport = await this.transport.sendMail({
                from: process.env.GMAIL,
                to: email,
                subject: "Lovedu Verification Code",
                text: `Your verification code is ${code}`
            })
            return transport;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}