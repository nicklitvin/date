import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { SocketHandler } from "../src/handlers/socket";
import { addMinutes } from "date-fns";
import { makeMockWebSocket } from "../__testUtils__/easySetup";
import { Message } from "@prisma/client";

describe("socket", () => {
    const funcs = new SocketHandler();

    afterEach( () => {
        funcs.clearData();
    })

    it("should create socket", async () => {
        const userID = "a";
        const socket = makeMockWebSocket();

        expect(funcs.addSocket({
            userID: userID,
            socket: socket
        })).not.toEqual(null);

        expect(funcs.isUserConnected(userID)).toEqual(true);
    })

    it("should delete socket", async () => {
        const userID = "a";
        const socket = makeMockWebSocket();

        funcs.addSocket({
            userID: userID,
            socket: socket
        })

        expect(funcs.removeSocket(socket)).not.toEqual(null);
        expect(funcs.isUserConnected(userID)).toEqual(false);
    })

    it("should delete expired entries", async () => {
        const socket = makeMockWebSocket();

        funcs.addSocket({
            userID: "a",
            socket: socket
        }, new Date(0));
        funcs.addSocket({
            userID: "b",
            socket: socket
        }, new Date(0));
        funcs.addSocket({
            userID: "c",
            socket: socket
        }, addMinutes(new Date(), 1));

        funcs.generateOneTimeKey("a", new Date(0));
        funcs.generateOneTimeKey("b", addMinutes(new Date(), 1));

        const deleted = funcs.deleteExpiredEntries();
        expect(deleted.socketsDeleted).toEqual(2);
        expect(deleted.keysDeleted).toEqual(1);
    })

    it("should send message", async () => {
        const socket = makeMockWebSocket();
        const userID = "a";
        const message = "hi";

        funcs.addSocket({
            userID: userID,
            socket: socket
        }, new Date(0));

        expect(socket.payloads).toHaveLength(0);
        funcs.sendUserMessage(userID, {
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

    it("should delete everything", async () => {
        funcs.generateOneTimeKey("a");
        funcs.generateOneTimeKey("b");

        const socket = makeMockWebSocket();
        funcs.addSocket({
            userID: "a",
            socket: socket
        }, new Date(0));

        const deleted = funcs.clearData();
        expect(deleted.keysDeleted).toEqual(2);
        expect(deleted.socketsDeleted).toEqual(1);
    })

    it("should delete key after use", async () => {
        const userID = "a";
        const key = funcs.generateOneTimeKey(userID);
        expect(funcs.getUserIDFromKey(key)).toEqual(userID);
        expect(funcs.getUserIDFromKey(key)).toEqual(undefined);
    })

    it("should delete user socket if one", async () => {
        const userID = "a";
        const socket = makeMockWebSocket();

        funcs.addSocket({
            socket: socket,
            userID: userID
        });
        expect(funcs.isUserConnected(userID)).toEqual(true);

        funcs.disconnectUser(userID);
        expect(funcs.isUserConnected(userID)).toEqual(false);

    })
})