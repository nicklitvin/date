import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { ChatPreview, Message, NewMatch, NewMatchDataInput, PublicProfile } from "../src/interfaces";
import { makePublicProfile, makeReceivedMessage, makeSentMessage, scrollHorizontally, scrollVertically } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import MatchesMob from "../app/(tabs)/Matches";

describe("matches", () => {
    const profiles = [
        makePublicProfile("id1"),
        makePublicProfile("id2"),
        makePublicProfile("id3"),
        makePublicProfile("id4"),
        makePublicProfile("id5")
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

    const newMatches : NewMatch[] = [
        {
            profile: profiles[2],
            timestamp: new Date(5)
        },
        {
            profile: profiles[3],
            timestamp: new Date(4)
        }
    ];

    const moreNewMatches : NewMatch[] = [
        {
            profile: profiles[4],
            timestamp: new Date(3)
        }
    ]

    const load = async ( useSave = false ) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getNewMatches).replyOnce( config =>
            [200, {
                data: newMatches
            }]
        )
        mock.onPost(URLs.server + URLs.getNewChatPreviews).replyOnce(config => 
            [200, {
                data: chatPreviews
            }]
        )

        const store = new RootStore();
        if (useSave) {
            store.receivedData.setChatPreviews(chatPreviews);
            store.receivedData.setNewMatches(newMatches);
        }
        const StoreProvider = createStoreProvider(store);
        const getNewMatchLength = jest.fn();
        const getChatPreviewLength = jest.fn()
        render(
            <StoreProvider value={store}>
                <MatchesMob
                    noAutoLoad={true}
                    getChatPreviewLength={getChatPreviewLength}
                    getNewMatchLength={getNewMatchLength}
                />
            </StoreProvider>
        )

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.load), "press");
        })

        return { store, mock, getChatPreviewLength, getNewMatchLength }
    }

    const loadMore = async (mock : MockAdapter) => {
        mock.onPost(URLs.server + URLs.getNewMatches).replyOnce( config => 
            [200, {
                data: moreNewMatches
            }]
        )
        mock.onPost(URLs.server + URLs.getNewChatPreviews).replyOnce(config => 
            [200, {
                data: moreChatPreviews
            }]
        )
    }

    it("should load everything", async () => {
        const { store, getChatPreviewLength, getNewMatchLength } = await load();

        expect(getChatPreviewLength).toHaveBeenLastCalledWith(chatPreviews.length);
        expect(getNewMatchLength).toHaveBeenLastCalledWith(newMatches.length);
        expect(store.receivedData.chatPreviews).toHaveLength(chatPreviews.length);
        expect(store.receivedData.newMatches).toHaveLength(newMatches.length);
    })

    it("should get more chat previews", async () => {
        const { mock, getChatPreviewLength, store } = await load();
        await loadMore(mock);

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.chatPreviewScroll), "scroll", scrollVertically)
        })

        const newLength = chatPreviews.length + moreChatPreviews.length;
        expect(getChatPreviewLength).toHaveBeenLastCalledWith(newLength);
        expect(store.receivedData.chatPreviews).toHaveLength(newLength);
    })

    it("should get more new matches", async () => {
        const { mock, getNewMatchLength, store } = await load();
        await loadMore(mock);

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.newMatchScroll), "scroll", scrollHorizontally)
        })

        const newLength = newMatches.length + moreNewMatches.length;
        expect(getNewMatchLength).toHaveBeenLastCalledWith(newLength);
        expect(store.receivedData.newMatches).toHaveLength(newLength);
    })
})