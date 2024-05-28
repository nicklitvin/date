import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { APIOutput, SwipeFeed } from "../src/interfaces";
import { makePublicProfile } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import FeedMob from "../app/(tabs)/Feed";
import { feedText } from "../src/text";

describe("feed", () => {
    const feed : SwipeFeed = {
        profiles: [
            makePublicProfile("id"),
            makePublicProfile("id1"),
            makePublicProfile("id2"),
        ],
        likedMeIDs: []
    }

    const moreFeed : SwipeFeed = {
        profiles: [
            makePublicProfile("id4")
        ],
        likedMeIDs: []
    }
        

    const load = async (useSave = false) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getFeed).replyOnce( config => 
            [200, {data: feed}]
        )
        mock.onPost(URLs.server + URLs.makeSwipe).reply( config => 
            [200, {data: {
                doesNot: "matter"
            }} as APIOutput<any>]
        )

        const store = new RootStore();
        store.globalState.setDisableFade(true);
        const StoreProvider = createStoreProvider(store);

        if (useSave) {
            store.receivedData.setSwipeFeed(feed)
        }

        render(
            <StoreProvider value={store}>
                <FeedMob
                    dontAutoLoad={true}
                />
            </StoreProvider>
        )

        if (!useSave) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.load), "press")
            })
        }

        return { store, mock }
    }

    const loadMore = async (mock : MockAdapter) => {
        mock.onPost(URLs.server + URLs.getFeed).replyOnce(config =>
            [200, {data: moreFeed}]
        )
    }

    const loadNothing = async (mock : MockAdapter) => {
        mock.onPost(URLs.server + URLs.getFeed).replyOnce(config =>
            [200, {data: null}]
        )
    }

    it("should load feed", async () => {
        const { store } = await load();

        expect(store.receivedData.swipeFeed?.profiles).toHaveLength(feed.profiles.length);
    })

    it("should go to next person", async () => {
        const { store } = await load();

        expect(store.globalState.swipeStatus?.feedIndex).toEqual(0);
        expect(store.globalState.swipeStatus?.lastSwipedIndex).toEqual(-1);

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.swipeLike), "press")
        });

        expect(store.globalState.swipeStatus?.feedIndex).toEqual(1);
        expect(store.globalState.swipeStatus?.lastSwipedIndex).toEqual(0);
    })

    it("should load more", async () => {
        const { mock, store } = await load();
        loadMore(mock)

        for (const _ of feed.profiles) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.swipeLike), "press")
            })
        };

        expect(store.receivedData.swipeFeed?.profiles).toHaveLength(moreFeed.profiles.length)
        expect(store.globalState.swipeStatus?.feedIndex).toEqual(0);
        expect(store.globalState.swipeStatus?.lastSwipedIndex).toEqual(-1);
    })

    it("should show no feed", async () => {
        const { mock, store } = await load();
        loadNothing(mock)

        for (const _ of feed.profiles) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.swipeLike), "press")
            })
        };

        expect(screen.queryByText(feedText.noMoreFeed)).not.toEqual(null);
    })
})