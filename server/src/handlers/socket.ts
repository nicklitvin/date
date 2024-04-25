import { addHours } from "date-fns";
import { SocketPayload } from "../interfaces";

export class SocketHandler {
    private readonly socketTTLHours = 1;
    private storage : Map<string, {
        socket: WebSocket,
        ttl: Date,
        userID: string
    }>;

    constructor() {
        this.storage = new Map();
    }

    public addSocket(input : { socket : WebSocket, userID : string}, 
        ttl = addHours(new Date(), this.socketTTLHours)
    ) {
        this.storage.set(input.userID, {
            socket: input.socket,
            ttl: ttl,
            userID: input.userID
        })
    }

    public removeSocket(socket : WebSocket) {
        const values = Array.from(this.storage.values());
        const entry = values.find(val => val.socket === socket);

        if (entry) {
            this.storage.delete(entry.userID);
        }

        return entry;
    }

    public deleteExpiredEntries() : number {
        let toDelete : string[] = [];

        this.storage.forEach( 
            val => val.ttl.getTime() < new Date().getTime() ? 
            toDelete.push(val.userID) : 
            null
        )

        for (let userID of toDelete) {
            this.storage.delete(userID);
        }

        return toDelete.length;
    }   

    public isUserConnected(userID : string) : boolean {
        return this.storage.has(userID);
    }

    public sendUserMessage(userID: string, data : SocketPayload) : boolean {
        try {
            const socket = this.storage.get(userID)?.socket;
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
}