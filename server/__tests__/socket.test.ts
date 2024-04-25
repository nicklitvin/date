import { describe, expect, it, jest } from "@jest/globals";
import { SocketHandler } from "../src/handlers/socket";
import { addMinutes } from "date-fns";

describe("socket", () => {
    const handler = new SocketHandler();

    const makeWebSocket = (messages : string[] = []) : any => ({
        send: (payload : string) => messages.push(payload)
    })

    it("should create socket", async () => {
        const userID = "a";
        const socket = makeWebSocket();

        expect(handler.addSocket({
            userID: userID,
            socket: socket
        })).not.toEqual(null);

        expect(handler.isUserConnected(userID)).toEqual(true);
    })

    it("should delete socket", async () => {
        const userID = "a";
        const socket = makeWebSocket();

        handler.addSocket({
            userID: userID,
            socket: socket
        })

        expect(handler.removeSocket(socket)).not.toEqual(null);
        expect(handler.isUserConnected(userID)).toEqual(false);
    })

    it("should delete expired entries", async () => {
        const socket = makeWebSocket();

        handler.addSocket({
            userID: "a",
            socket: socket
        }, new Date(0));
        handler.addSocket({
            userID: "b",
            socket: socket
        }, new Date(0));
        handler.addSocket({
            userID: "c",
            socket: socket
        }, addMinutes(new Date(), 1));

        expect(handler.deleteExpiredEntries()).toEqual(2);
    })

    it("should send message", async () => {
        const messages : string[] = []
        const socket = makeWebSocket(messages);
        const userID = "a";

        handler.addSocket({
            userID: userID,
            socket: socket
        }, new Date(0));

        expect(messages).toHaveLength(0);
        handler.sendUserMessage(userID, {
            message: {
                id: "1",
                message: "hi",
                readStatus: false,
                recepientID: "2",
                timestamp: new Date(),
                userID: "2"
            }
        })
        expect(messages).toHaveLength(1);
    })

})