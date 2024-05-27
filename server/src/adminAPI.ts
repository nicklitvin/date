import yargs from "yargs";
import { sampleContent } from "./globals";
import { sampleUsers } from "./sample";
import axios from "axios";
import { URLs } from "./urls";
import { AnnouncementInput, APIRequest, JustUserID, MessageInput, SwipeInput } from "./interfaces";
import dotenv from "dotenv";
import { addHours } from "date-fns";

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
    .option("announcement", {
        alias: "a",
        describe: "make announcement",
        type: "boolean"
    })
    .help()
    .alias('help', 'h')
    .argv as { message?: string; match?: boolean, ping?: boolean, clear?: boolean, premium?: boolean, announcement?: boolean};

async function main() {
    const baseURL = `http://${URLs.ip}:${URLs.port}`;

    if (argv.ping) {
        console.log("ping")
    }
    
    if (argv.clear) {
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
    
    if (argv.message) {
        const payload : APIRequest<MessageInput> = {
            key: process.env.ADMIN_API_KEY!,
            message: argv.message,
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
    
    if (argv.match) {
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

    if (argv.premium) {
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

    if (argv.announcement) {
        try {   
            const payload : APIRequest<AnnouncementInput> = {
                key: process.env.ADMIN_API_KEY!,
                title: "announcement title",
                message: "announcement message",
                startTime: new Date(),
                endTime: addHours(new Date(), 1)
            }
            const response = await axios.post(baseURL + URLs.makeAnnouncement, payload);
            if (response.data?.message) console.log(response.data.message);
            console.log("completed announcement");
        } catch (err) {
            console.log(err);
        }
    }
}

main();
