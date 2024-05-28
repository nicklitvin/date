import { PrismaClient } from "@prisma/client";
import express from "express";
import { Handler } from "./handler";
import { APIHandler } from "./api";
import { sampleContent } from "./globals";
import { attributeList } from "./others";
import fs from "fs/promises";
import { sampleUsers } from "./sample";
import expressWs from "express-ws";
import { URLs } from "./urls";

export interface EnvironmentSetup {
    loginUser: boolean,
    verifyUser: boolean,
    createUser : boolean,
    addSubscription : boolean,
    createSampleUsers : boolean,
    clearTables : boolean,
    clearInteractionEntries : boolean
}

export class MyServer {
    private app;
    private server;
    public handler : Handler;

    constructor({disableEmail = false}) {
        this.app = expressWs(express()).app;
        this.app.use( (req,res,next) => {
            if (req.originalUrl == "/webhook") next();
            else express.json()(req,res,next);
        })

        this.handler = new Handler({
            prisma: new PrismaClient(),
            disableEmail: disableEmail,
            disableNotifications: false,
        });
        new APIHandler(this.app, this.handler);
        this.server = this.app.listen(URLs.port);
    }

    public async setupEnvironment(input : EnvironmentSetup = {
        loginUser: false,
        verifyUser: false,
        createUser: false,
        addSubscription: false,
        createSampleUsers: false,
        clearTables: false,
        clearInteractionEntries: false
    }) {
        // clear tables must be first
        if (input.clearTables) {
            await this.handler.deleteEverything();
        }

        const attributes = await this.handler.attribute.getAttributes();
        if (Object.keys(attributes).length == 0) {
            await this.handler.resetAttributes();
        }

        if (input.clearInteractionEntries) {
            await Promise.all([
                this.handler.swipe.deleteAllSwipes(),
                this.handler.message.deleteAllMessages()
            ])
        }

        if (input.loginUser) {
            await this.handler.loginWithToken({},sampleContent.email);
        }

        if (input.verifyUser) {
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
        
        if (input.createUser) {
            const fileString = (await fs.readFile("./__testUtils__/images/michael1.jpg")).toString("base64");
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

        if (input.createSampleUsers) {
            const images = ["keanu1.jpg","keanu2.jpg","leo1.jpg","scarlett1.jpg","cate1.jpg","morgan1.jpg","anne1.jpg","samuel1.jpg","jennifer1.jpg",];
            const buffers = await Promise.all(images.map(val => fs.readFile(`__testUtils__/images/${val}`)));
    
            const imageIDs = await Promise.all(buffers.map( val => this.handler.image.uploadImage({
                buffer: val,
                mimetype: "image/jpeg"
            }))) as string[]
    
            const copy = sampleUsers;
            copy[0].images = [imageIDs[0],imageIDs[1]];
            copy[1].images = [imageIDs[2]];
            copy[2].images = [imageIDs[3]];
            copy[3].images = [imageIDs[4]];
            copy[4].images = [imageIDs[5]];
            copy[5].images = [imageIDs[6]];
            copy[6].images = [imageIDs[7]];
            copy[7].images = [imageIDs[8]];
    
            await this.handler.createSample(copy);
        }

        if (input.addSubscription) {
            await this.handler.processSubscriptionPay({
                userID: sampleContent.userID,
                subscriptionID: "randomID"
            })
        }
    }

    close() {
        this.server.closeAllConnections();
        this.server.close()
    }
}