import { PrismaClient } from "@prisma/client";
import express from "express";
import { Handler } from "./handler";
import { APIHandler } from "./api";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const handler = new Handler({
    prisma: new PrismaClient(),
});
new APIHandler(app, handler);

const func = async () => {
    await handler.deleteEverything();
}
func();
    
app.listen(3000);
console.log("running server")