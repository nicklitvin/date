import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();


const x = async () => {
    await prisma.user.create({
        data: {
            id: 1,
            name: "nick"
        }
    })
    console.log("asd");
}
x();

app.get("/", (req, res) => {
    res.json("hi");
})



app.listen(3000);