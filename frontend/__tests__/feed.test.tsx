import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SwipeFeed } from "../src/interfaces";
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
            [200]
        )

        const store = new RootStore();
        store.globalState.setDisableFade(true);
        const StoreProvider = createStoreProvider(store);
        const getFeedIndex = jest.fn();
        const getFeedLength = jest.fn();

        if (useSave) {
            store.receivedData.setSwipeFeed(feed)
        }

        render(
            <StoreProvider value={store}>
                <FeedMob
                    dontAutoLoad={true}
                    getFeedIndex={getFeedIndex}
                    getFeedLength={getFeedLength}
                />
            </StoreProvider>
        )

        if (!useSave) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.load), "press")
            })
        }

        return { store, mock, getFeedIndex, getFeedLength }
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
        const { getFeedLength } = await load();

        expect(getFeedLength).toHaveBeenLastCalledWith(feed.profiles.length);
    })

    it("should go to next person", async () => {
        const { getFeedIndex } = await load();

        expect(getFeedIndex).toHaveBeenLastCalledWith(0);

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.swipeLike), "press")
        });

        expect(getFeedIndex).toHaveBeenLastCalledWith(1);
    })

    it("should load more", async () => {
        const { mock, getFeedLength, store } = await load();
        loadMore(mock)

        for (const _ of feed.profiles) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.swipeLike), "press")
            })
        };

        expect(getFeedLength).toHaveBeenLastCalledWith(moreFeed.profiles.length)
        expect(store.receivedData.swipeFeed?.profiles).toHaveLength(moreFeed.profiles.length);
    })

    it("should show no feed", async () => {
        const { mock, getFeedLength, store } = await load();
        loadNothing(mock)

        for (const _ of feed.profiles) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.swipeLike), "press")
            })
        };

        expect(screen.queryByText(feedText.noMoreFeed)).not.toEqual(null);
    })
})