import { PrismaClient } from "@prisma/client";
import express from "express";
import { Handler } from "./handler";
import { APIHandler } from "./api";

const app = express();
const handler = new Handler({
    prisma: new PrismaClient(),
});
new APIHandler(app, handler);
    
app.listen(3000);
console.log("running server")