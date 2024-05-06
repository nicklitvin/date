import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { APIOutput, ChatPreview, Message, NewMatchData, PublicProfile } from "../src/interfaces";
import { makePublicProfile, makeReceivedMessage, makeSentMessage, scrollHorizontally, scrollVertically } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import MatchesMob from "../app/(tabs)/Matches";
import { SocketManager } from "../src/components/SocketManager";

describe("matches", () => {
    const profiles = [
        makePublicProfile("id1"),
        makePublicProfile("id2"),
        makePublicProfile("id3"),
        makePublicProfile("id4"),
        makePublicProfile("id5"),
        makePublicProfile("newNotification"),
    ];

    const chatPreviews : ChatPreview[] = [
        {
            profile: profiles[0],
            message:  makeSentMessage(profiles[0].id)
        },
        {
            profile: profiles[1],
            message: makeReceivedMessage(profiles[1].id)
        }
    ]

    const moreChatPreviews : ChatPreview[] = [
        {
            profile: profiles[4],
            message: makeReceivedMessage(profiles[4].id)
        }
    ]

    const newMatches : NewMatchData[] = [
        {
            profile: profiles[2],
            timestamp: new Date(5)
        },
        {
            profile: profiles[3],
            timestamp: new Date(4)
        }
    ];

    const moreNewMatches : NewMatchData[] = [
        {
            profile: profiles[4],
            timestamp: new Date(3)
        }
    ]

    const notificationNewMatch : NewMatchData = {
        profile: profiles[5],
        timestamp: new Date()
    }

    const load = async ( useSave = false ) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getNewMatches).replyOnce( config =>
            [200, { data: newMatches } as APIOutput<NewMatchData[]>]
        )
        mock.onPost(URLs.server + URLs.getNewChatPreviews).replyOnce(config => 
            [200, { data: chatPreviews } as APIOutput<ChatPreview[]>]
        )

        const store = new RootStore();
        if (useSave) {
            store.receivedData.setChatPreviews(chatPreviews);
            store.receivedData.setNewMatches(newMatches);
        }
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <MatchesMob noAutoLoad={true} />
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
        mock.onPost(URLs.server + URLs.getNewMatches).replyOnce( config => 
            [200, { data: moreNewMatches } as APIOutput<NewMatchData[]>]
        )
        mock.onPost(URLs.server + URLs.getNewChatPreviews).replyOnce(config => 
            [200, { data: moreChatPreviews } as APIOutput<ChatPreview[]>]
        )
    }

    it("should load everything", async () => {
        const { store } = await load();
        expect(store.receivedData.chatPreviews).toHaveLength(chatPreviews.length);
        expect(store.receivedData.newMatches).toHaveLength(newMatches.length);
    })

    it("should get more chat previews", async () => {
        const { mock, store } = await load();
        await loadMore(mock);

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.chatPreviewScroll), "scroll", scrollVertically)
        })

        expect(store.receivedData.chatPreviews).toHaveLength(chatPreviews.length + moreChatPreviews.length);
    })

    it("should get more new matches", async () => {
        const { mock, store } = await load();
        await loadMore(mock);

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.newMatchScroll), "scroll", scrollHorizontally)
        })

        expect(store.receivedData.newMatches).toHaveLength(newMatches.length + moreNewMatches.length);
    })

    it("should add new match from socket manager", async () => {
        const { store } = await load();
        const socketManager = new SocketManager({
            testMode: true,
            receivedData: store.receivedData
        })

        await act( () => {
            socketManager.updateWithMatch(notificationNewMatch);
        })

        expect(store.receivedData.newMatches).toHaveLength(newMatches.length + 1);
        expect(store.receivedData.newMatches![0].profile.id).toEqual(notificationNewMatch.profile.id);
    })

    it("should move new match to chat preview on message", async () => {
        const { store } = await load();
        const socketManager = new SocketManager({
            testMode: true,
            receivedData: store.receivedData
        })

        const notificationMessage : Message = {
            id: "randomID",
            message: "message",
            readStatus: false,
            recepientID: "random",
            timestamp: new Date(),
            userID: newMatches[0].profile.id
        }
        await act( () => {
            socketManager.updateChatWithMessage(notificationMessage);
        })

        expect(store.receivedData.newMatches).toHaveLength(newMatches.length - 1);
        expect(store.receivedData.chatPreviews).toHaveLength(chatPreviews.length + 1);
        expect(store.receivedData.chatPreviews![0].profile.id).toEqual(newMatches[0].profile.id);
    })

    it("should update chat preview with new message", async () => {
        const { store } = await load();
        const socketManager = new SocketManager({
            testMode: true,
            receivedData: store.receivedData
        })

        const notificationMessage : Message = {
            id: "randomID",
            message: "new notification message",
            readStatus: false,
            recepientID: "random",
            timestamp: new Date(),
            userID: chatPreviews[1].profile.id
        }
        await act( () => {
            socketManager.updateChatWithMessage(notificationMessage);
        })

        expect(store.receivedData.chatPreviews).toHaveLength(chatPreviews.length);
        expect(store.receivedData.chatPreviews![0].message.userID).toEqual(notificationMessage.userID)
        expect(store.receivedData.chatPreviews![0].message.message).toEqual(notificationMessage.message)
    })
})