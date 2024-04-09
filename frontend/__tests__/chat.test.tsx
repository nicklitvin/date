import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { ChatMob } from "../app/Chat";
import { GetChatInput, Message, MessageInput, PublicProfile, UserReportWithReportedID } from "../src/interfaces";
import { chatText } from "../src/text";
import { testIDS } from "../src/testIDs";
import { getChatTimestamp } from "../src/utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { scrollVertically } from "../__testUtils__/easySetup";

describe("chat", () => {
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
            readStatus: true,
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
            readStatus: false,
            recepientID: recepientProfile.id,
            timestamp: new Date(Date.UTC(2000, 0, 1, 6, 0)),
            userID: myUserID
        } 
    ]

    const newMessage : Message[] = [
        {
            id: "id3",
            message: "very new message",
            readStatus: true,
            recepientID: myUserID,
            timestamp: new Date(Date.UTC(2000, 0, 1, 10, 0)),
            userID: recepientProfile.id
        }
    ]

    const loadChat = async (useSave = false) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getProfile).replyOnce( config =>
            [200, {
                data: recepientProfile
            }]
        )
        mock.onPost(URLs.server + URLs.getChat).replyOnce(config => {
            const payload = JSON.parse(config.data) as GetChatInput;
            expect(payload.withID).toEqual(recepientProfile.id);
            return [200, {
                data: latestMessages
            }]
        })
        mock.onPost(URLs.server + URLs.sendReadStatus).reply(config => [200])

        const store = new RootStore();
        store.globalState.setTimezone(timezone);
        if (useSave) {
            store.receivedData.addSavedChat(
                recepientProfile.id, latestMessages.concat(moreMessages)
            )
        }
        const StoreProvider = createStoreProvider(store);
        const getChatLength = jest.fn();
        const getUnsentLength = jest.fn();
        render(
            <StoreProvider value={store}>
                <ChatMob 
                    getChatLength={getChatLength}
                    userID={recepientProfile.id}
                    noAutoLoad={true}
                    getUnsentLength={getUnsentLength}
                    noRouter={true}
                />
            </StoreProvider>
        )

        if (!useSave) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.load), "press");
            })
        }

        return { store, mock, getChatLength, getUnsentLength }
    }

    const loadMore = async (mock : MockAdapter) => {
        mock.onPost(URLs.server + URLs.getChat).replyOnce( config => {
            const payload = JSON.parse(config.data) as GetChatInput;

            expect(new Date(payload.fromTime).getTime()).toEqual(
                latestMessages[1].timestamp.getTime() - 1
            )
            expect(payload.withID).toEqual(recepientProfile.id);

            return [200, {
                data: moreMessages
            }];
        })

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.chatScroll), "scroll", scrollVertically)
        })
    }

    const loadNewMessages = async (mock : MockAdapter) => {
        mock.onPost(URLs.server + URLs.getChat).replyOnce( config => 
            [200, {
                data: newMessage
            }]   
        )

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.loadNew), "press");
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

        await act( () => {
            fireEvent(screen.getByTestId(`message-${myMessage}`), "press")
        });
    }

    it("should load chat", async () => {
        const { getChatLength } = await loadChat();

        expect(screen.queryByText(recepientProfile.name)).not.toEqual(null);
        expect(getChatLength).toHaveBeenLastCalledWith(latestMessages.length);
    })

    it("should load older messages", async () => {
        const { mock, getChatLength } = await loadChat();
        expect(getChatLength).toHaveBeenLastCalledWith(latestMessages.length);
        await loadMore(mock);
        expect(getChatLength).toHaveBeenLastCalledWith(latestMessages.length + 1);
    })

    it("should report user", async () => {
        let sent = false;
        const { mock, store } = await loadChat();

        store.receivedData.setChatPreviews([{
            message: latestMessages[0],
            profile: recepientProfile
        }])
        store.receivedData.setNewMatches([{
            profile: recepientProfile,
            timestamp: new Date()
        }])

        mock.onPost(URLs.server + URLs.reportUser).reply( config => {
            const payload = JSON.parse(config.data) as UserReportWithReportedID;
            expect(payload.reportedID).toEqual(recepientProfile.id);
            sent = true;
            return [200]
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
        const { mock } = await loadChat();

        expect(screen.queryByText(chatText.read)).not.toEqual(null);
        expect(screen.queryByText(chatText.delivered)).toEqual(null);
        expect(screen.getByTestId(`readStatus-${latestMessages[0].id}`)).not.toEqual(null);

        await loadMore(mock);

        expect(screen.queryByText(chatText.read)).not.toEqual(null);
        expect(screen.queryByText(chatText.delivered)).toEqual(null);
        expect(screen.getByTestId(`readStatus-${latestMessages[0].id}`)).not.toEqual(null);
    })

    it("should say unsent on unsent message", async () => {
        const { getChatLength, getUnsentLength } = await loadChat();

        const myMessage = "hi";
        const myInput = screen.getByPlaceholderText(chatText.inputPlaceholder);
        await act( () => {
            fireEvent(myInput, "changeText", myMessage);
        })
        await act( () => {
            fireEvent(myInput, "submitEditing");
        })

        expect(screen.queryByText(chatText.unsent)).not.toEqual(null);
        expect(getChatLength).toHaveBeenLastCalledWith(latestMessages.length + 1);
        expect(getUnsentLength).toHaveBeenLastCalledWith(1);
    })

    it("should resend unsent message", async () => {
        const { mock, getUnsentLength } = await loadChat();

        const myMessage = "my undelivered";
        await sendMessage(myMessage);
        expect(getUnsentLength).toHaveBeenLastCalledWith(1);
        expect(screen.queryByText(chatText.unsent)).not.toEqual(null);

        mock.onPost(URLs.server + URLs.sendMessage).replyOnce(config => {
            const payload = JSON.parse(config.data) as MessageInput;
            const message : Message = {
                id: "randomID",
                message: payload.message,
                readStatus: false,
                recepientID: payload.recepientID,
                timestamp: new Date(),
                userID: "id"
            }
            return [200, {
                data: message
            }];
        })

        await act( () => {
            fireEvent(screen.getByTestId(`message-${myMessage}`), "press");
        })

        expect(getUnsentLength).toHaveBeenLastCalledWith(0);
        expect(screen.queryByText(chatText.unsent)).toEqual(null);
    })

    it("should save loaded chat", async () => {
        const { store } = await loadChat();

        expect(store.receivedData.savedChats[recepientProfile.id]).toHaveLength(latestMessages.length);
    })

    it("should load saved chat", async () => {
        const { getChatLength } = await loadChat(true);
        
        expect(getChatLength).toHaveBeenLastCalledWith(
            latestMessages.length + moreMessages.length
        );
    })

    it("should load recent messages", async () => {
        const { mock, getChatLength } = await loadChat(false);
        await loadNewMessages(mock);

        expect(getChatLength).toHaveBeenLastCalledWith(
            latestMessages.length + newMessage.length
        )
        expect(screen.queryByText(newMessage[0].message)).not.toEqual(null);
    })

    it("should update my read status", async () => {
        expect(latestMessages[1].userID).toEqual(recepientProfile.id);
        expect(latestMessages[1].readStatus).toEqual(false);

        const { store } = await loadChat();

        store.receivedData.setChatPreviews([{
            message: latestMessages[0],
            profile: recepientProfile
        }])

        const index = store.receivedData.chatPreviews?.findIndex( val => val.profile.id == recepientProfile.id);
        expect(store.receivedData.chatPreviews![index!].message.readStatus).toEqual(true);
    })
})