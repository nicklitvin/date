import axios from "axios";
import { globals } from "./globals";
import { URLs } from "./urls";
import { APIOutput } from "./interfaces";

export function getChatTimestamp(date : Date, timezone : string) {
    let timestamp = date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone
    });

    timestamp = timestamp.toLowerCase();
    const isMay = timestamp.includes("may");

    timestamp = timestamp.charAt(0).toUpperCase() + timestamp.slice(1,3) + (isMay ? "" : ".") + 
        timestamp.slice(3, timestamp.length - 3) + timestamp.slice(timestamp.length - 2);
    return timestamp;
}

export function getShortDate(date : Date, timezone? : string) {
    let timestamp = date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        timeZone: timezone
    });

    timestamp = timestamp.toLowerCase();
    const isMay = timestamp.includes("may");

    timestamp = timestamp.charAt(0).toUpperCase() + timestamp.slice(1,3) + 
        (isMay ? "" : ".") + timestamp.slice(3);

    return timestamp;
}

export function getBirthdayStamp(date : Date) {
    let timestamp = date.toLocaleDateString(undefined, {
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });

    timestamp = timestamp.toLowerCase();
    const isMay = timestamp.includes("may");

    timestamp = timestamp.charAt(0).toUpperCase() + timestamp.slice(1,3) + (isMay ? "" : ".") +
        timestamp.slice(3, timestamp.length);

    return timestamp
}

export function createTimeoutSignal() {
    const control = new AbortController();
    const timeout = setTimeout( () => {
        control.abort();
    }, globals.apiRequestTimeout * 1000);
    if (process.env.NODE_ENV == "test") {
        timeout.unref()
    }
    
    return control.signal;
}

export function setCustomTimer(callback : () => any, seconds : number) : NodeJS.Timeout {
    const newTimer = setTimeout(callback, seconds*1000);
    if (process.env.NODE_ENV == "test") {
        newTimer.unref()
    }
    return newTimer;
}

export async function sendRequest<T>(subURL : string, data : any) : Promise<APIOutput<T>> {
    const print = false;

    try {
        if (print) console.log("sending request to", subURL, "with data", data);
        const response = await axios.post(URLs.server + subURL, data, {
            signal: createTimeoutSignal(),
        })
        const responseData = response.data as APIOutput<T>;
        if (print) console.log("response from", subURL, responseData);
        return responseData
    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (print) console.log("axios error", err.response?.data?.message, err.response?.status);

            return {message : err.response?.data.message}
        } else {
            return {message: "Error with request"}
        }  
    }
}

export function makeBriefSummaryText(message : string, myMessage : boolean) {
    let returnedMessage = message;

    if (myMessage) {
        returnedMessage = `You: ${returnedMessage}`
    }

    if (returnedMessage.length > globals.maxPreviewMessageLength) {
        returnedMessage = returnedMessage.slice(0,globals.maxPreviewMessageLength) + "..."
    }

    return returnedMessage
}