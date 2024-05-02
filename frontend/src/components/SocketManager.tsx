import { Message, NewMatchData, SocketPayloadToClient, SocketPayloadToServer } from "../interfaces";
import { ReceivedData } from "../store/ReceivedData";
import { URLs } from "../urls";


export class SocketManager {
    private ws : WebSocket|undefined;
    private received : ReceivedData;

    private approvedMessages : Map<string, Message>;

    constructor(input : {
        socketToken?: string, 
        receivedData : ReceivedData,
        testMode?: boolean
    }) {
        this.received = input.receivedData;
        this.approvedMessages = new Map();

        if (!input.testMode) {
            const ip = URLs.server.split("http://")[1];
            this.ws = new WebSocket(`ws://${ip}${URLs.websocket}?token=${input.socketToken}`);

            this.ws.onmessage = (e : MessageEvent<string>) => {
                try {
                    const data = JSON.parse(e.data) as SocketPayloadToClient;
                    if (data.payloadProcessedID) {
                        if (data.message) {
                            this.approvedMessages.set(data.payloadProcessedID, data.message)
                        }  
                    } else if (data.match) {
                        this.updateWithMatch(data.match);
                    } else if (data.message) {
                        this.updateChatWithMessage(data.message)
                    }
                } catch (err) {
    
                }
            };
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    sendData(data : SocketPayloadToServer) {
        try {
            if (this.ws) this.ws.send(JSON.stringify(data));
        } catch (err) {

        }
    }

    updateChatWithMessage(message : Message) {
        if (!this.received.newMatches || !this.received.chatPreviews) return 

        const newMatchIndex = this.received.newMatches.findIndex(val => message.userID == val.profile.id)
        const oldMatchIndex = this.received.chatPreviews.findIndex(val => message.userID == val.profile.id);

        if (newMatchIndex > -1) {
            const newMatchData = this.received.newMatches[newMatchIndex];

            const newMatchList = [...this.received.newMatches];
            newMatchList.splice(newMatchIndex, 1);
            this.received.setNewMatches(newMatchList);

            this.received.setChatPreviews([
                { profile: newMatchData.profile, message: { ...message, timestamp: new Date(message.timestamp) } }, 
                ...this.received.chatPreviews
            ])
        } else if (oldMatchIndex > -1) {
            const oldMatchData = this.received.chatPreviews[oldMatchIndex];

            const newList = [...this.received.chatPreviews]
            newList.slice(oldMatchIndex, 1);

            this.received.setChatPreviews([
                { profile: oldMatchData.profile, message: { ...message, timestamp: new Date(message.timestamp) }},
                ...newList
            ])
        }
    }

    updateWithMatch(match : NewMatchData) {
        if (!this.received.newMatches) return 

        const newMatchList : NewMatchData[] = [
            { ...match, timestamp: new Date(match.timestamp)}, 
            ...this.received.newMatches!
        ];
        this.received.setNewMatches(newMatchList);
    }

    wasMessageProcessed(id : string) : Message|undefined {
        const message = this.approvedMessages.get(id);
        this.approvedMessages.delete(id);
        return message;
    }
}