import express from "express";

const app = express();
app.get("/", (req, res) => {
    res.json("hi");
})

app.listen(3000);