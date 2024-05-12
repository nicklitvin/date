import yargs from "yargs";
import { sampleContent } from "./globals";
import { sampleUsers } from "./sample";
import axios from "axios";
import { URLs } from "./urls";
import { APIRequest, MessageInput, SwipeInput } from "./interfaces";
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
    .help()
    .alias('help', 'h')
    .argv as { message?: string; match?: boolean, ping?: boolean };

const { message, match, ping } = argv;

async function main() {
    if (ping) {
        console.log("ping")
    } else if (message) {
        const payload : APIRequest<MessageInput> = {
            key: process.env.ADMIN_API_KEY!,
            message: message,
            userID: sampleUsers[0].id,
            recepientID: sampleContent.userID
        }
        try {
            const response = await axios.post(URLs.ip + URLs.sendMessage, payload);
            if (response.data?.message) console.log(response.data.message);
            console.log("complete");
        } catch (err) {
            console.log(err);
        }
    } else if (match) {
        const payload1 : APIRequest<SwipeInput> = {
            key: process.env.ADMIN_API_KEY!,
            userID: sampleUsers[0].id,
            action: "Like",
            swipedUserID: sampleContent.userID
        }
        const payload2 : SwipeInput & {key : string} = {
            key: process.env.ADMIN_API_KEY!,
            userID: sampleContent.userID,
            action: "Like",
            swipedUserID: sampleUsers[0].id
        }
        try {
            const [one,two] = await Promise.all([
                axios.post(URLs.ip + URLs.makeSwipe, payload1),
                axios.post(URLs.ip + URLs.makeSwipe, payload2),
            ])
            if (one.data?.message) console.log(one.data.message);
            if (two.data?.message) console.log(two.data.message);
            console.log("completed");
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log("bad input");
    }
}

main();
