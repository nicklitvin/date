import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { ChatMob } from "../app/Chat";
import { APIOutput, GetChatInput, Message, MessageInput, PublicProfile, UserReportWithReportedID } from "../src/interfaces";
import { chatText, generalText } from "../src/text";
import { testIDS } from "../src/testIDs";
import { getChatTimestamp } from "../src/utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { makePublicProfile, scrollVertically } from "../__testUtils__/easySetup";
import { SocketManager } from "../src/components/SocketManager";
import { randomUUID } from "expo-crypto";

describe("chat page", () => {
    const myUserID = "userID";
    const timezone = "America/Los_Angeles"
    const recepientProfile : PublicProfile = {
        name: "Michael",
        age: 21,
        attributes: [],
        description: "",
        gender: "Male",
        id: "abc",
        images: [{id: "image_id_1", url: "image_url_1"}],
        alcohol: "Often",
        smoking: "Never"
    }
    const latestMessages : Message[] = [
        {
            id: "id",
            message: "hi",
            readStatus: false,
            recepientID: recepientProfile.id,
            timestamp: new Date(Date.UTC(2000, 0, 1, 8, 1)),
            userID: myUserID
        },
        {
            id: "id1",
            message: "hey",
            readStatus: false,
            recepientID: myUserID,
            timestamp: new Date(Date.UTC(2000, 0, 1, 8, 0)),
            userID: recepientProfile.id
        }
    ]
    const moreMessages : Message[] = [
        {
            id: "id2",
            message: "sooo",
            readStatus: true,
            recepientID: recepientProfile.id,
            timestamp: new Date(Date.UTC(2000, 0, 1, 6, 0)),
            userID: myUserID
        } 
    ]

    const newMessage : Message = {
        id: "id3",
        message: "very new message",
        readStatus: false,
        recepientID: myUserID,
        timestamp: new Date(Date.UTC(2000, 0, 1, 10, 0)),
        userID: recepientProfile.id
    }

    const loadChat = async (useSave = false) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getProfile).replyOnce( config =>
            [200, { data: recepientProfile } as APIOutput<PublicProfile>]
        )
        
        mock.onPost(URLs.server + URLs.getChat).replyOnce(config => {
            const payload = JSON.parse(config.data) as GetChatInput;
            expect(payload.withID).toEqual(recepientProfile.id);
            return [200, { data: latestMessages } as APIOutput<Message[]>]
        })

        const store = new RootStore();
        store.globalState.setTimezone(timezone);
        store.globalState.setSocketManager(new SocketManager({
            receivedData: store.receivedData,
            testMode: true
        }))
        store.receivedData.setProfile(makePublicProfile());
        store.receivedData.setChatPreviews([
            {
                message: latestMessages[0],
                profile: recepientProfile
            }
        ])
        
        store.receivedData.setNewMatches([]);

        if (useSave) {
            store.receivedData.addSavedChat(
                recepientProfile.id, latestMessages.concat(moreMessages)
            )
        }
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob 
                    userID={recepientProfile.id}
                    noAutoLoad={true}
                    noRouter={true}
                />
            </StoreProvider>
        )

        if (!useSave) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.load), "press");
            })
        }

        return { store, mock }
    }

    const loadMore = async (mock : MockAdapter) => {
        mock.onPost(URLs.server + URLs.getChat).replyOnce( config => {
            const payload = JSON.parse(config.data) as GetChatInput;

            expect(new Date(payload.fromTime).getTime()).toEqual(
                latestMessages[1].timestamp.getTime() - 1
            )
            expect(payload.withID).toEqual(recepientProfile.id);

            return [200, { data: moreMessages } as APIOutput<Message[]> ];
        })

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.chatScroll), "scroll", scrollVertically)
        })
    }

    const sendMessage = async (myMessage : string) => {
        const myInput = screen.getByPlaceholderText(chatText.inputPlaceholder);
        await act( () => {
            fireEvent(myInput, "changeText", myMessage);
        })
        await act( () => {
            fireEvent(myInput, "submitEditing");
        })
    }

    it("should send message", async () => {
        const { store } = await loadChat();
        
        const myMessage = "message";
        await sendMessage(myMessage);
        expect(store.globalState.loadingMessageIDs.size).toEqual(1);
        expect(screen.queryByText(chatText.sending)).not.toEqual(null);
        expect(store.receivedData.savedChats[recepientProfile.id].length).toEqual(
            latestMessages.length + 1
        )

        const messageID : string = store.globalState.loadingMessageIDs.values().next().value;
        await act( () => {
            store.globalState.socketManager!.approveMessage(messageID, {
                id: `approved-${randomUUID()}`,
                message: myMessage,
                readStatus: false,
                recepientID: recepientProfile.id,
                timestamp: new Date(),
                userID: "myID" 
            })
        })

        expect(store.globalState.socketManager!.approvedMessages.size).toEqual(1);

        await act( async () => {
            await new Promise((res) => setTimeout(res, 1000))
        })

        expect(store.globalState.loadingMessageIDs.size).toEqual(0);
        expect(screen.queryByText(chatText.sending)).toEqual(null);
        expect(screen.queryByText(chatText.delivered)).not.toEqual(null);
        expect(store.receivedData.savedChats[recepientProfile.id].length).toEqual(
            latestMessages.length + 1
        );

        const preview = store.receivedData.chatPreviews?.find(val => val.profile.id == recepientProfile.id);
        expect(preview?.message.message).toEqual(myMessage);
        expect(store.receivedData.chatPreviews?.length).toEqual(1);
    })

    it("should receive new message", async () => {
        const { store } = await loadChat();

        await act( () => {
            store.globalState.socketManager!.updateChatWithMessage(newMessage);
        })

        expect(store.receivedData.savedChats[recepientProfile.id]).toHaveLength(
            latestMessages.length + 1
        )
        const preview = store.receivedData.chatPreviews!.find( val => val.profile.id == recepientProfile.id);
        expect(preview?.message.id).toEqual(newMessage.id);
    })

    it("should not send sent messages", async () => {
        const { store } = await loadChat();

        await act( () => {
            fireEvent(screen.getByTestId(`message-${latestMessages[0].message}`), "press")
            fireEvent(screen.getByTestId(`message-${latestMessages[1].message}`), "press")
        })

        expect(store.globalState.loadingMessageIDs.size).toEqual(0);
        expect(store.globalState.unsentMessageIDs.size).toEqual(0);
    })

    it("should resend unsent message", async () => {
        const { store } = await loadChat();

        const message = "new message";
        await sendMessage(message);
        await act( async () => {
            await new Promise(res => setTimeout(res, 1000));
        })

        expect(store.globalState.loadingMessageIDs.size).toEqual(0);
        expect(store.globalState.unsentMessageIDs.size).toEqual(1);

        await act( () => {
            fireEvent(screen.getByTestId(`message-${message}`),"press");
        })

        expect(store.globalState.loadingMessageIDs.size).toEqual(1);
        expect(store.globalState.unsentMessageIDs.size).toEqual(0);
    })

    it("should load chat", async () => {
        await loadChat();
        expect(screen.queryByText(latestMessages[0].message)).not.toEqual(null);
    })

    it("should load older messages", async () => {
        const { mock, store } = await loadChat();
        expect(store.receivedData.savedChats[recepientProfile.id]).toHaveLength(
            latestMessages.length
        );
        await loadMore(mock);
        expect(store.receivedData.savedChats[recepientProfile.id]).toHaveLength(
            latestMessages.length + moreMessages.length
        );
    })

    it("should report user from new matches and chat previews", async () => {
        let sent = false;
        const { mock, store } = await loadChat();

        await act( () => {
            store.receivedData.setChatPreviews([{
                message: latestMessages[0],
                profile: recepientProfile
            }])
            store.receivedData.setNewMatches([{
                profile: recepientProfile,
                timestamp: new Date()
            }])
        })

        mock.onPost(URLs.server + URLs.reportUser).reply( config => {
            const payload = JSON.parse(config.data) as UserReportWithReportedID;
            expect(payload.reportedID).toEqual(recepientProfile.id);
            sent = true;
            return [200, {} as APIOutput<void>]
        })

        expect(store.receivedData.chatPreviews).toHaveLength(1);
        expect(store.receivedData.newMatches).toHaveLength(1);

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.reportUser), "press");
        })
        await act( () => {
            fireEvent(screen.getByText(chatText.modalReport), "press")
        })

        expect(sent).toEqual(true);
        expect(store.receivedData.chatPreviews).toHaveLength(0);
        expect(store.receivedData.newMatches).toHaveLength(0);
    })

    it("should show timestamps", async () => {
        const { mock } = await loadChat();

        expect(screen.queryByText(getChatTimestamp(
            latestMessages[1].timestamp, timezone)
        )).not.toEqual(null);
        expect(screen.queryByText(getChatTimestamp(
            moreMessages[0].timestamp, timezone)
        )).toEqual(null);

        await loadMore(mock);

        expect(screen.queryByText(getChatTimestamp(
            moreMessages[0].timestamp, timezone)
        )).not.toEqual(null);
        expect(screen.queryByText(getChatTimestamp(
            latestMessages[1].timestamp, timezone)
        )).not.toEqual(null);
    })

    it("should show message read status", async () => {
        const {} = await loadChat();
        expect(screen.queryByTestId(`readStatus-${latestMessages[0].id}`))
        expect(screen.queryByText(chatText.read)).toEqual(null);
        expect(screen.queryByText(chatText.delivered)).not.toEqual(null);
    })

    it("should not update read status if latest message not user's", async () => {
        const { store } = await loadChat();

        expect(store.receivedData.chatPreviews![0].profile.id).toEqual(recepientProfile.id);
        expect(store.receivedData.chatPreviews![0].message.readStatus).toEqual(false);
    })

    it("should update read status on open", async () => {
        const { store } = await loadChat(false);

        await act( () => {
            store.globalState.socketManager?.updateChatWithMessage(newMessage);
        })

        const preview = store.receivedData.chatPreviews![0];
        expect(preview.message.id).toEqual(newMessage.id);
        expect(preview.message.userID).toEqual(recepientProfile.id);
        expect(preview.message.readStatus).toEqual(true);
    })

    it("should update recepients read status", async () => {
        const { store } = await loadChat(false);

        expect(screen.queryByText(chatText.delivered)).not.toEqual(null);

        await act( () => {
            store.globalState.socketManager?.updateReadStatus({
                userID: recepientProfile.id,
                toID: "me",
                timestamp: new Date()
            })
        })

        expect(screen.queryByText(chatText.read)).not.toEqual(null);
    })
})