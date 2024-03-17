import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { statsText } from "../src/text"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import { URLs } from "../src/urls"
import { UserSwipeStats } from "../src/interfaces"
import { RootStore, createStoreProvider } from "../src/store/RootStore"
import StatsMob from "../app/(tabs)/Stats"
import { testIDS } from "../src/testIDs"

describe("stats", () => {
    const load = async (loadNothing : boolean, useSave = false) => {
        const url = "url";
        const stats : UserSwipeStats = {
            allTime: {
                dislikedMe: 10,
                likedMe: 10,
                myDislikes: 10,
                myLikes: 10
            },
            weekly: [
                {
                    dislikedMe: 10,
                    likedMe: 10,
                    myDislikes: 10,
                    myLikes: 10
                }
            ]
        }
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getStats).replyOnce( config =>
            [200, {data: loadNothing ? null : stats}]
        )
        mock.onPost(URLs.server + URLs.getCheckoutPage).reply( config => [
            200, {data: url}
        ])

        const store = new RootStore();
        if (useSave) {
            store.receivedData.setStats(stats)
        }
        const StoreProvider = createStoreProvider(store);
        const openLinkFunc = jest.fn();

        render(
            <StoreProvider value={store}>
                <StatsMob 
                    noAutoLoad={true}
                    openLinkFunc={openLinkFunc}
                    dontLoadCharts={true}
                />
            </StoreProvider>
        )

        await act( () => {
            fireEvent(screen.getByTestId(testIDS.load), "press")
        })

        return { mock, store, openLinkFunc, url }
    }

    it("should open link if no stats", async () => {
        const { openLinkFunc, url } = await load(true);

        await act( () => {
            fireEvent(screen.getByText(statsText.purchaseButton), "press")
        });

        expect(openLinkFunc).toHaveBeenCalledTimes(1);
        expect(openLinkFunc).toHaveBeenLastCalledWith(url);
    })

    it("should render stats", async () => {
        const { store } = await load(false);

        expect(screen.queryByText(statsText.purchaseButton)).toEqual(null);
        expect(store.receivedData.stats).not.toEqual(null);
    })

    it("should save stats", async () => {
        const { store } = await load(false);

        expect(store.receivedData.stats).not.toEqual(null);
    })
})