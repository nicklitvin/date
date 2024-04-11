import { PrismaClient } from "@prisma/client";
import express from "express";
import { Handler } from "./handler";
import { APIHandler } from "./api";
import bodyParser from "body-parser";
import { sampleContent } from "./globals";
import { attributeList } from "./others";
import fs from "fs/promises";
import { sampleUsers } from "./sample";

export class MyServer {
    public readonly port = 3000;

    private app;
    private handler : Handler;
    private APIHandler : APIHandler;
    private server;

    constructor({disableEmail = false}) {
        this.app = express();
        this.app.use(bodyParser.json());

        this.handler = new Handler({
            prisma: new PrismaClient(),
            disableEmail: disableEmail
        });
        this.APIHandler = new APIHandler(this.app, this.handler);
        this.server = this.app.listen(this.port);
    }

    public async setupEnvironment({
        loginUser = false,
        verifyUser = false,
        createUser = false,
        createSampleUsers = false,
        clearTables = false
    }) {
        if (clearTables) {
            await this.handler.deleteEverything();
        }

        if (loginUser) {
            await this.handler.loginWithToken({},sampleContent.email);
        }

        if (verifyUser) {
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
        
        if (createUser) {
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

        if (createSampleUsers) {
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
    }

    close() {
        this.server.closeAllConnections();
        this.server.close()
    }
}