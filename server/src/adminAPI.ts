import yargs from "yargs";
import { sampleContent } from "./globals";
import { sampleUsers } from "./sample";
import axios from "axios";
import { URLs } from "./urls";
import { APIRequest, JustUserID, MessageInput, SwipeInput } from "./interfaces";
import dotenv from "dotenv";

dotenv.config();

const argv = yargs
    .option('message', {
        alias: 'm',
        describe: 'Specify a message',
        type: 'string',
    })
    .option('match', {
        alias: 'l',
        describe: 'Will make match',
        type: "boolean",
    })
    .option('ping', {
        alias: "p",
        describe: "ping",
        type: "boolean"
    })
    .option("clear", {
        alias: "c",
        describe: "clears interactions",
        type: "boolean"
    })
    .option("premium", {
        alias: "b",
        describe: "purchase premium",
        type: "boolean"
    })
    .help()
    .alias('help', 'h')
    .argv as { message?: string; match?: boolean, ping?: boolean, clear?: boolean, premium?: boolean };

const { message, match, ping, clear, premium } = argv;

async function main() {
    const baseURL = `http://${URLs.ip}:${URLs.port}`;

    if (ping) {
        console.log("ping")
    }
    
    if (clear) {
        try {
            const payload : APIRequest<{}> = {
                key: process.env.ADMIN_API_KEY!
            }
            const response = await axios.post(baseURL + URLs.clearInteractions, payload);
            if (response.data?.message) console.log(response.data.message);
            console.log("completed clear");
        } catch (err) {
            console.log(err);
        }
    } 
    
    if (message) {
        const payload : APIRequest<MessageInput> = {
            key: process.env.ADMIN_API_KEY!,
            message: message,
            userID: sampleUsers[0].id,
            recepientID: sampleContent.userID
        }
        try {
            const response = await axios.post(baseURL + URLs.sendMessage, payload);
            if (response.data?.message) console.log(response.data.message);
            console.log("completed message");
        } catch (err) {
            console.log(err);
        }
    }
    
    if (match) {
        const payload1 : SwipeInput & {key : string} = {
            key: process.env.ADMIN_API_KEY!,
            userID: sampleContent.userID,
            action: "Like",
            swipedUserID: sampleUsers[0].id
        }
        const payload2 : APIRequest<SwipeInput> = {
            key: process.env.ADMIN_API_KEY!,
            userID: sampleUsers[0].id,
            action: "Like",
            swipedUserID: sampleContent.userID
        }
        try {
            const one = await axios.post(baseURL + URLs.makeSwipe, payload1);
            const two = await axios.post(baseURL + URLs.makeSwipe, payload2);
            if (one.data?.message) console.log(one.data.message);
            if (two.data?.message) console.log(two.data.message);
            console.log("completed match");
        } catch (err) {
            console.log(err);
        }
    } 

    if (premium) {
        try {
            const payload : APIRequest<JustUserID> = {
                key: process.env.ADMIN_API_KEY!,
                userID: sampleContent.userID
            }
            const response = await axios.post(baseURL + URLs.purchasePremium, payload);
            if (response.data?.message) console.log(response.data.message);
            console.log("completed premium");
        } catch (err) {
            console.log(err);
        }
    }
}

main();
