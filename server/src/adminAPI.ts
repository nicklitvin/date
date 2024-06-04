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
        alias: 'x',
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
    .option("attributes", {
        alias: "g",
        describe: "get attributes",
        type: "boolean"
    })
    .option("delete", {
        alias: "d",
        describe: "deletes tables",
        type: "boolean"
    })
    .option("logout", {
        alias: "l",
        describe: "force logout",
        type: "boolean"
    })
    .help()
    .alias('help', 'h')
    .argv as { 
        message?: string, 
        match?: boolean, 
        clear?: boolean, 
        premium?: boolean, 
        announcement?: boolean, 
        attributes?: boolean,
        delete?: boolean,
        logout?: boolean
    };

async function main() {
    const baseURL = `http://${URLs.ip}:${URLs.port}`;
    const adminKEY = process.env.ADMIN_API_KEY!
    
    if (argv.clear) {
        try {
            const payload : APIRequest<{}> = {
                key: adminKEY
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
            key: adminKEY,
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
            key: adminKEY,
            userID: sampleContent.userID,
            action: "Like",
            swipedUserID: sampleUsers[0].id
        }
        const payload2 : APIRequest<SwipeInput> = {
            key: adminKEY,
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
                key: adminKEY,
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
                key: adminKEY,
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

    if (argv.attributes) {
        try {
            const response = await axios.post(baseURL + URLs.getAttributes, null);
            console.log(response.data);
            console.log("completed attributes");
        } catch (err) {
            console.log(err);
        }
    }

    if (argv.delete) {
        try {   
            const payload : APIRequest<{}> = {
                key: adminKEY
            }
            await axios.post(baseURL + URLs.deleteEverything, payload);
            console.log("completed deleted")
        } catch (err) {
            console.log(err);
        }
    }

    if (argv.logout) {
        try {
            const payload : APIRequest<JustUserID> = {
                key: adminKEY,
                userID: sampleContent.userID
            }
            await axios.post(baseURL + URLs.forceLogout, payload);
            console.log("completed logout")
        } catch (err) {
            console.log(err);
        }
    }
}

main();
