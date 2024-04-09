import { PrismaClient } from "@prisma/client";
import express from "express";
import { Handler } from "./handler";
import { APIHandler } from "./api";
import bodyParser from "body-parser";
import fs from "fs/promises"
import { attributeList } from "./others";
import { sampleContent } from "./globals";

const app = express();
app.use(bodyParser.json());

const handler = new Handler({
    prisma: new PrismaClient(),
    disableEmail: true
});
new APIHandler(app, handler);

const func = async () => {
    await handler.deleteEverything();
    await handler.loginWithToken({},sampleContent.email);
    await handler.getVerificationCode({
        email: sampleContent.email, 
        schoolEmail: sampleContent.eduEmail
    });
    await handler.verifyUserWithCode({
        email: sampleContent.email,
        schoolEmail: sampleContent.eduEmail,
        code: sampleContent.code
    })
    const fileString = (await fs.readFile("./__testUtils__/goodImage.jpg")).toString("base64");
    await handler.createUser({
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
        id: sampleContent.userID,
        name: "Michael",
        smoking: "Never"
    })
    await handler.createSample();
}
func();
    
app.listen(3000);
console.log("running server")