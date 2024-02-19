import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { FeedMob } from "../src/pages/Feed";
import { PublicProfile } from "../src/interfaces";
import { makePublicProfile } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";

describe("feed", () => {
    it("should go to next person", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const feed : PublicProfile[] = [
            makePublicProfile("id"),
            makePublicProfile("id1"),
            makePublicProfile("id2"),
        ]
        const getFeedIndex = jest.fn( (input : number) => input);

        render(
            <StoreProvider value={store}>
                <FeedMob
                    feed={feed}
                    customReturnFeedIndex={getFeedIndex}
                />
            </StoreProvider>
        )

        expect(getFeedIndex).toHaveLastReturnedWith(0);

        const likeButton = screen.getByTestId(testIDS.swipeLike);
        await act( () => {
            fireEvent(likeButton, "press")
        });

        expect(getFeedIndex).toHaveLastReturnedWith(1);
    })

    it("should show not load more users if none", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const feed : PublicProfile[] = [
            makePublicProfile("id"),
            makePublicProfile("id1"),
            makePublicProfile("id2"),
        ]
        
        render(
            <StoreProvider value={store}>
                <FeedMob
                    feed={[]}
                    customLoadFeed={feed}
                />
            </StoreProvider>
        )

        expect(store.savedAPICalls.getFeed).toEqual(null);
    })

    it("should load more users", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const feed : PublicProfile[] = [
            makePublicProfile("id"),
        ]
        const moreFeed : PublicProfile[] = [
            makePublicProfile("id2"),
            makePublicProfile("id3"),
        ]
        const getFeedLength = jest.fn( (input : number) => input);
        
        render(
            <StoreProvider value={store}>
                <FeedMob
                    feed={feed}
                    customLoadFeed={moreFeed}
                    customReturnFeedLength={getFeedLength}
                />
            </StoreProvider>
        )

        expect(getFeedLength).toHaveLastReturnedWith(1);

        const likeButton = screen.getByTestId(testIDS.swipeLike);
        await act( () => {
            fireEvent(likeButton,"press");
        })

        expect(getFeedLength).toHaveLastReturnedWith(3);
    })
})