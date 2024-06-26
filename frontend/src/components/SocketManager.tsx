import { globals } from "../globals";
import { ChatPreview, LoginOutput, Message, NewMatchData, ReadStatusInput, SocketPayloadToClient, SocketPayloadToServer, WithKey } from "../interfaces";
import { ReceivedData } from "../store/ReceivedData";
import { generalText } from "../text";
import { URLs } from "../urls";
import { sendRequest } from "../utils";
import { showToast } from "./Toast";

export class SocketManager {
    private ws : WebSocket|undefined;
    private received : ReceivedData;
    private loginKey : string|undefined;
    private navigation : any; // NavigationProp

    public approvedMessages : Map<string, Message>;

    constructor(input : {
        socketToken?: string, 
        receivedData : ReceivedData,
        testMode?: boolean,
        key?: string,
        navigation?: any
    }) {
        this.received = input.receivedData;
        this.approvedMessages = new Map();
        this.loginKey = input.key;
        this.navigation = input.navigation;

        if (!input.testMode && input.socketToken) {
            this.connect(this.createConnectURL(input.socketToken));
        }
    }

    createConnectURL(socketToken : string) {
        return `ws://${URLs.server.split("http://")[1]}${URLs.websocket}?token=${socketToken}`
    }

    connect(url : string) {
        // console.log("connecting to server",url);
        this.ws = new WebSocket(url);

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
                } else if (data.forceLogout) {
                    console.log("LOGGOUT")
                    this.close();
                    delete this.ws;
                    showToast("Error", generalText.loggedOut);
                    this.received.removeLoginKey();
                    if (this.navigation) {
                        this.navigation.reset({
                            index: 0,
                            routes: [{
                                name: "SignIn" as never
                            }]
                        })
                    }
                }
            } catch (err) {

            }
        };

        this.ws.onclose = (event : CloseEvent) => {
            // console.log("socket closed by server",event, "status of connection", this.ws?.readyState);
            delete this.ws;
        }
    }

    close() {
        if (this.ws) this.ws.close(1000);
    }

    async reconnect() {
        const input : WithKey<{}> = {
            key: this.loginKey
        }
        const response = await sendRequest<LoginOutput>(URLs.getSocketCode, input);
        if (response.data && response.data.socketToken) {
            this.connect(this.createConnectURL(response.data.socketToken));
        }
    }

     async sendData(data : SocketPayloadToServer) {
        try {
            if (this.ws) {
                this.ws.send(JSON.stringify(data));
            } else {
                await this.reconnect();

                new Promise( res => {
                    setTimeout( () => {
                        if (this.ws) this.ws.send(JSON.stringify(data));
                        res(null);
                    }, globals.timeToConnectSocketMS)
                })
            }
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