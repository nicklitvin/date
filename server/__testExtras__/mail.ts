import { MailHandler } from "../src/abstracts";

export class MockEmailHandler extends MailHandler {
    constructor() {
        super();
    }

    sendVerificationCode(email: string, code: number): Promise<any> {
        const message = `sending ${code} to ${email}`;
        this.count += 1;
        return Promise.resolve(message);
    }
}