import { describe, expect, it, jest } from "@jest/globals";
import { SocketHandler } from "../src/handlers/socket";
import { addMinutes } from "date-fns";
import { makeMockWebSocket } from "../__testUtils__/easySetup";
import { Message } from "@prisma/client";

describe("socket", () => {
    const handler = new SocketHandler();


    it("should create socket", async () => {
        const userID = "a";
        const socket = makeMockWebSocket();

        expect(handler.addSocket({
            userID: userID,
            socket: socket
        })).not.toEqual(null);

        expect(handler.isUserConnected(userID)).toEqual(true);
    })

    it("should delete socket", async () => {
        const userID = "a";
        const socket = makeMockWebSocket();

        handler.addSocket({
            userID: userID,
            socket: socket
        })

        expect(handler.removeSocket(socket)).not.toEqual(null);
        expect(handler.isUserConnected(userID)).toEqual(false);
    })

    it("should delete expired entries", async () => {
        const socket = makeMockWebSocket();

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
        const socket = makeMockWebSocket();
        const userID = "a";
        const message = "hi";

        handler.addSocket({
            userID: userID,
            socket: socket
        }, new Date(0));

        expect(socket.payloads).toHaveLength(0);
        handler.sendUserMessage(userID, {
            message: {
                id: "1",
                message: message,
                readStatus: false,
                recepientID: "2",
                timestamp: new Date(),
                userID: "2"
            }
        })
        expect(socket.payloads).toHaveLength(1);

        const sentMessage : Message = JSON.parse(socket.payloads[0]).message;
        expect(sentMessage.message).toEqual(message);
    })
})