import axios from "axios";
import { globals } from "./globals";
import { URLs } from "./urls";
import { WithKey } from "./interfaces";

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

export async function sendRequest(subURL : string, data : any) {
    const print = true;

    if (print) console.log("sending request to", subURL, "with data", data);
    const response = await axios.post(URLs.server + subURL, data, {
        signal: createTimeoutSignal(),
    })
    if (print) console.log("response from", subURL, response?.data?.data);
    return response;
}