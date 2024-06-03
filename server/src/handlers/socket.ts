import { addHours, addMinutes } from "date-fns";
import { randomUUID } from "crypto";
import { WebSocket } from "ws";
import { SocketPayloadToClient } from "../interfaces";

interface DeleteData {
    socketsDeleted : number,
    keysDeleted : number
}

export class SocketHandler {
    private readonly socketTTLHours = 1;
    private readonly oneTimeKeyTTLMin = 1;

    // userID" {socket, ttl, userID}
    private connectedSockets : Map<string, {
        socket: WebSocket,
        ttl: Date,
        userID: string,
    }>;
    // key : {userID, ttl, key}
    private oneTimeKeys : Map<string, {
        userID: string,
        ttl: Date,
        key: string
    }>;

    constructor() {
        this.connectedSockets = new Map();
        this.oneTimeKeys = new Map();
    }

    public generateOneTimeKey(userID : string, 
        ttl = addMinutes(new Date(), this.oneTimeKeyTTLMin)) : string 
    {
        const oneTimeKey = randomUUID();
        this.oneTimeKeys.set(oneTimeKey, {
            userID: userID,
            ttl: ttl,
            key: oneTimeKey
        });
        // console.log("generating one time key", userID, oneTimeKey);
        return oneTimeKey;
    }

    public getUserIDFromKey(key : string) : string|undefined {
        const entry = this.oneTimeKeys.get(key);

        this.oneTimeKeys.delete(key);

        if (!entry || new Date().getTime() > entry.ttl.getTime() ) {
            return undefined
        } else {
            this.oneTimeKeys.delete(key);
            return entry.userID;
        }
    }

    public addSocket(input : { socket : WebSocket, userID : string}, 
        ttl = addHours(new Date(), this.socketTTLHours)
    ) {
        this.connectedSockets.set(input.userID, {
            socket: input.socket,
            ttl: ttl,
            userID: input.userID,
        })
    }

    public removeSocket(socket : WebSocket) {
        const values = Array.from(this.connectedSockets.values());
        const entry = values.find(val => val.socket === socket);

        if (entry) {
            this.connectedSockets.delete(entry.userID);
        }

        return entry;
    }

    public deleteExpiredEntries() : DeleteData {
        let toDeleteSockets : string[] = [];
        this.connectedSockets.forEach( 
            val => val.ttl.getTime() < new Date().getTime() ? 
            toDeleteSockets.push(val.userID) : 
            null
        )
        for (let userID of toDeleteSockets) {
            this.connectedSockets.delete(userID);
        }

        let toDeleteKeys : string[] = [];
        this.oneTimeKeys.forEach( 
            val => val.ttl.getTime() < new Date().getTime() ? 
            toDeleteKeys.push(val.key) : 
            null
        )
        for (let oneTimeKey of toDeleteKeys) {
            this.oneTimeKeys.delete(oneTimeKey);
        }

        return {
            keysDeleted: toDeleteKeys.length,
            socketsDeleted: toDeleteSockets.length
        }
    }   

    public isUserConnected(userID : string) : boolean {
        return this.connectedSockets.has(userID);
    }

    public sendUserMessage(userID: string, data : SocketPayloadToClient) : boolean {
        try {
            const socket = this.connectedSockets.get(userID)?.socket;
            const object = JSON.stringify(data);
            if (socket) {
                socket.send(object);
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    public clearData() : DeleteData {
        const socketsDeleted = this.connectedSockets.size;
        const keysDeleted = this.oneTimeKeys.size;
        this.connectedSockets.clear();
        this.oneTimeKeys.clear();
        return {keysDeleted, socketsDeleted}
    }

    public disconnectUser(userID : string) {
        const socketData = this.connectedSockets.get(userID);
        if (socketData) {
            this.sendUserMessage(userID, {
                forceLogout: true
            })
            socketData.socket.close(1000);
            this.connectedSockets.delete(userID);
        }
    }
}