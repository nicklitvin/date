import { Message, NewMatchData, SocketPayloadToClient, SocketPayloadToServer } from "../interfaces";
import { ReceivedData } from "../store/ReceivedData";
import { URLs } from "../urls";
import { makeBriefSummaryText } from "../utils";

export class SocketUser {
    private ws : WebSocket;
    private received : ReceivedData;

    constructor(socketToken: string, receivedData : ReceivedData) {
        const ip = URLs.server.split("http://")[1];
        this.ws = new WebSocket(`ws://${ip}${URLs.websocket}?token=${socketToken}`);
        this.received = receivedData;
        
        this.ws.onmessage = (e : MessageEvent<string>) => {
            try {
                const data = JSON.parse(e.data) as SocketPayloadToClient;
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
}