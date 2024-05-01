import { Message, NewMatchData, SocketPayloadToClient, SocketPayloadToServer } from "../interfaces";
import { ReceivedData } from "../store/ReceivedData";
import { URLs } from "../urls";

export class SocketUser {
    private ws : WebSocket;
    private received : ReceivedData;

    private approvedMessages : Map<string, Message>;

    constructor(socketToken: string, receivedData : ReceivedData) {
        const ip = URLs.server.split("http://")[1];
        this.ws = new WebSocket(`ws://${ip}${URLs.websocket}?token=${socketToken}`);
        this.received = receivedData;
        this.approvedMessages = new Map();
        
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

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    sendData(data : SocketPayloadToServer) {
        try {
            this.ws.send(JSON.stringify(data));
        } catch (err) {

        }
    }

    updateChatWithMessage(message : Message) {
        if (!this.received.newMatches || !this.received.chatPreviews) return 

        const newMatchIndex = this.received.newMatches.findIndex( val => [message.userID, message.recepientID].includes(val.profile.id));

        if (newMatchIndex) {
            const newMatchData  = this.received.newMatches[newMatchIndex];

            const newMatchList = [...this.received.newMatches];
            newMatchList.splice(newMatchIndex, 1);
            this.received.setNewMatches(newMatchList);

            this.received.setChatPreviews([
                { profile: newMatchData.profile, message: message }, 
                ...this.received.chatPreviews]
            )
        } else {
            const oldMatchIndex = this.received.chatPreviews.findIndex( val => [message.userID, message.recepientID].includes(val.profile.id))
            const oldMatchData = this.received.chatPreviews[oldMatchIndex];

            const newList = [...this.received.chatPreviews]
            newList.slice(oldMatchIndex, 1);

            this.received.setChatPreviews([
                { profile: oldMatchData.profile, message: message},
                ...newList
            ])
        }
    }

    updateWithMatch(match : NewMatchData) {
        if (!this.received.newMatches) return 

        const newMatchList = [...this.received.newMatches!, match];
        this.received.setNewMatches(newMatchList);
    }

    wasMessageProcessed(id : string) : Message|undefined {
        const message = this.approvedMessages.get(id);
        this.approvedMessages.delete(id);
        return message;
    }
}