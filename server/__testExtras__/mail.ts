import { MailHandler } from "../src/interfaces";

export class MockEmailHandler implements MailHandler {
    constructor() {}

    sendVerificationCode(email: string, code: number): Promise<any> {
        return Promise.resolve(`sending ${code} to ${email}`);
    }
}