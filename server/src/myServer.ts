import { PrismaClient } from "@prisma/client";
import express from "express";
import { Handler } from "./handler";
import { APIHandler } from "./api";
import bodyParser from "body-parser";
import { sampleContent } from "./globals";
import { attributeList } from "./others";
import fs from "fs/promises";

export class MyServer {
    public readonly port = 3000;
    private loginUser : boolean;
    private verifyUser : boolean; 
    private createUser : boolean;

    private app;
    private handler : Handler;
    private APIHandler : APIHandler;
    private server;

    constructor({
        loginUser = false,
        verifyUser = false,
        createUser = false,
        disableEmail = false
    }) {
        this.loginUser = loginUser;
        this.verifyUser = verifyUser;
        this.createUser = createUser;

        this.app = express();
        this.app.use(bodyParser.json());

        this.handler = new Handler({
            prisma: new PrismaClient(),
            disableEmail: disableEmail
        });
        this.APIHandler = new APIHandler(this.app, this.handler);
        this.server = this.app.listen(this.port);
    }

    public async createSample() {
        await this.handler.deleteEverything();
        if (this.loginUser) {
            await this.handler.loginWithToken({},sampleContent.email);
        }

        if (this.verifyUser) {
            await this.handler.getVerificationCode({
                email: sampleContent.email, 
                schoolEmail: sampleContent.eduEmail
            });
            await this.handler.verifyUserWithCode({
                email: sampleContent.email,
                schoolEmail: sampleContent.eduEmail,
                code: sampleContent.code
            })
        }
        
        if (this.createUser) {
            const fileString = (await fs.readFile("./__testUtils__/goodImage.jpg")).toString("base64");
            await this.handler.createUser({
                ageInterest: [18,30],
                alcohol: "Never",
                attributes: [attributeList.Fitness[0]],
                birthday: new Date(2000,1,1),
                description: "description",
                email: sampleContent.email,
                files: [{
                    content: fileString,
                    mimetype: "image/jpeg"
                }],
                gender: "Female",
                genderInterest: ["Female"],
                userID: sampleContent.userID,
                name: "Michael",
                smoking: "Never"
            })
        }
        
        await this.handler.createSample();
    }

    close() {
        this.server.closeAllConnections();
        this.server.close()
    }
}