import { PrismaClient } from "@prisma/client";
import express from "express";
import { Handler } from "./handler";
import { APIHandler } from "./api";
import bodyParser from "body-parser";
import { globals } from "./globals";
import fs from "fs/promises"

const app = express();
app.use(bodyParser.json());

const handler = new Handler({
    prisma: new PrismaClient(),
});
new APIHandler(app, handler);

const func = async () => {
    await handler.deleteEverything();
    await handler.loginWithToken({},globals.sampleEmail);
    await handler.getVerificationCode({
        email: globals.sampleEmail, 
        schoolEmail: globals.sampleSchoolEmail
    });
    await handler.verifyUserWithCode({
        email: globals.sampleEmail,
        schoolEmail: globals.sampleSchoolEmail,
        code: globals.sampleVerificationCode
    })
    await handler.createUser({
        ageInterest: [18,30],
        alcohol: "Never",
        attributes: ["as"],
        birthday: new Date(2000,1,1),
        description: "description",
        email: globals.sampleEmail,
        files: [{
            buffer: Buffer.from(await fs.readFile("./__testUtils__/goodImage.jpg")).toString("base64"),
            mimetype: "image/jpeg"
        }],
        gender: "Female",
        genderInterest: ["Female"],
        id: globals.sampleUserID,
        name: "Michael",
        smoking: "Never"
    })
}
func();
    
app.listen(3000);
console.log("running server")