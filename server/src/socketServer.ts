import http, { IncomingMessage } from "http";
import { Express } from "express";
import { WebSocket } from "ws";
import { Handler } from "./handler";
import { SocketPayloadToClient, SocketPayloadToServer } from "./interfaces";

export class SocketServer {
    private readonly portNumber = 8080;
    private handler : Handler;

    constructor(app : Express, handler : Handler) {
        this.handler = handler;
        const server = http.createServer(app);
        const wss = new WebSocket.Server({
            server: server,
            port: this.portNumber
        })
        
        wss.on("connection", (ws : WebSocket, req : IncomingMessage) => {
            try {
                if (!req.url) return ws.close(401);

                const url = new URL(req.url);
                const token = url.searchParams.get("token");

                if (!token) return ws.close(401);
                const userID = this.handler.socket.getUserIDFromKey(token);

                if (!userID) return ws.close(401);

                if (userID) {
                    this.handler.socket.addSocket({
                        socket: ws,
                        userID: userID
                    })
                }
            } catch (err) {
                return ws.close(500);
            }

            ws.on("message", async (stream : string) => {
                const returnPayload : SocketPayloadToClient = {
                    inputProcessed: false
                };

                try {   
                    const data : SocketPayloadToServer = JSON.parse(stream);
                    if (data.message) {
                        const output = await handler.sendMessage(data.message);
                        returnPayload.inputProcessed = output.data != null;
                    } else if (data.readUpdate) {
                        const output = await handler.updateReadStatus(data.readUpdate);
                        returnPayload.inputProcessed == output.data != null;
                    }
                } catch (err) {
                    console.log(err);
                    return
                } 

                ws.send(JSON.stringify(returnPayload));
            })
        })
    }
}