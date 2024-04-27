import http, { IncomingMessage } from "http";
import { Express } from "express";
import { WebSocket } from "ws";
import { Handler } from "./handler";
import { SocketPayload } from "./interfaces";

export class SocketServer {
    private handler : Handler;

    constructor(app : Express, handler : Handler) {
        this.handler = handler;
        const server = http.createServer(app);
        const wss = new WebSocket.Server({
            server: server
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

            ws.on("message", (stream : string) => {
                try {   
                    const data : SocketPayload = JSON.parse(stream);
                } catch (err) {
                    console.log(err);
                    return
                } 
            })
        })
    }
}