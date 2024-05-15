import { ChatPreview, Message, NewMatchData, ReadStatusInput, SocketPayloadToClient, SocketPayloadToServer } from "../interfaces";
import { ReceivedData } from "../store/ReceivedData";
import { URLs } from "../urls";


export class SocketManager {
    private ws : WebSocket|undefined;
    private received : ReceivedData;
    private connectURL : string|undefined;

    public approvedMessages : Map<string, Message>;

    constructor(input : {
        socketToken?: string, 
        receivedData : ReceivedData,
        testMode?: boolean
    }) {
        this.received = input.receivedData;
        this.approvedMessages = new Map();

        if (!input.testMode) {
            const ip = URLs.server.split("http://")[1];
            this.connectURL = `ws://${ip}${URLs.websocket}?token=${input.socketToken}`;
            this.connect();
        }
    }

    connect() {
        if (!this.connectURL) return 
        
        this.ws = new WebSocket(this.connectURL);

        this.ws.onmessage = (e : MessageEvent<string>) => {
            try {
                const data = JSON.parse(e.data) as SocketPayloadToClient;
                if (data.payloadProcessedID) {
                    if (data.message) {
                        this.approveMessage(data.payloadProcessedID, {
                            ...data.message,
                            timestamp: new Date(data.message.timestamp)
                        });
                    }  
                } else if (data.match) {
                    this.updateWithMatch({
                        ...data.match,
                        timestamp: new Date(data.match.timestamp)
                    });
                } else if (data.message) {
                    this.updateChatWithMessage({
                        ...data.message,
                        timestamp: new Date(data.message.timestamp)
                    })
                } else if (data.readUpdate) {
                    this.updateReadStatus({
                        ...data.readUpdate,
                        timestamp: new Date(data.readUpdate.timestamp)
                    })
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
            if (this.ws) this.ws.send(JSON.stringify(data));
        } catch (err) {

        }
    }

    approveMessage(payloadID : string, message : Message) {
        this.approvedMessages.set(payloadID, message);
    }

    updateChatWithMessage(message : Message) {
        if (!this.received.newMatches || !this.received.chatPreviews) return 

        const newMatchIndex = this.received.newMatches.findIndex(val => [message.userID, message.recepientID].includes(val.profile.id))
        const oldMatchIndex = this.received.chatPreviews.findIndex(val => [message.userID, message.recepientID].includes(val.profile.id));
        
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
            newList.splice(oldMatchIndex, 1);

            const updatedPreviews : ChatPreview[] = [
                { profile: oldMatchData.profile, message: { ...message, timestamp: new Date(message.timestamp) }},
                ...newList
            ];

            this.received.setChatPreviews(updatedPreviews)
        }

        if (this.received.savedChats[message.userID]) {
            this.received.addSavedChat(message.userID, 
                [
                    message,
                    ...this.received.savedChats[message.userID]
                ]
            )
        }
    }

    updateWithMatch(match : NewMatchData) {
        if (!this.received.newMatches) return 

        const newMatchList : NewMatchData[] = [
            match,
            ...this.received.newMatches!
        ];
        this.received.setNewMatches(newMatchList);
    }

    wasMessageProcessed(id : string) : Message|undefined {
        const message = this.approvedMessages.get(id);
        this.approvedMessages.delete(id);
        return message;
    }

    updateReadStatus(input : ReadStatusInput) {
        const messages = this.received.savedChats[input.userID];
        if (messages) {
            const copy : Message[] = JSON.parse(JSON.stringify(messages));
            for (const message of copy) {
                message.timestamp = new Date(message.timestamp);
            }
            for (const message of copy) {
                if (message.recepientID == input.userID && message.timestamp.getTime() < input.timestamp.getTime()) {
                    message.readStatus = true;
                }
                if (message.timestamp.getTime() > input.timestamp.getTime()) break;
            }
            this.received.addSavedChat(input.userID, copy);
        }
    }
}