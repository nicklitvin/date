import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore"
import { ProfileViewMob } from "../src/pages/ProfileView";
import { makePublicProfile } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";
import { profileViewText } from "../src/text";

describe("profileview", () => {
    it("should render not swipe version", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const afterSwipeFn = jest.fn();
        const profile = makePublicProfile("id");

        render(
            <StoreProvider value={store}>
                <ProfileViewMob
                    isInSwipeFeed={false}
                    afterSwipe={afterSwipeFn}
                    profile={profile}
                />
            </StoreProvider>
        )

        expect(screen.queryByTestId(testIDS.swipeLike)).toEqual(null);
        expect(screen.queryByTestId(testIDS.swipeDislike)).toEqual(null);
        expect(screen.queryByText(profileViewText.pageTitle)).not.toEqual(null);
    })

    it("should render swipe version", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const afterSwipeFn = jest.fn();
        const profile = makePublicProfile("id");

        render(
            <StoreProvider value={store}>
                <ProfileViewMob
                    isInSwipeFeed={true}
                    afterSwipe={afterSwipeFn}
                    profile={profile}
                />
            </StoreProvider>
        )

        expect(screen.queryByTestId(testIDS.swipeLike)).not.toEqual(null);
        expect(screen.queryByTestId(testIDS.swipeDislike)).not.toEqual(null);
        expect(screen.queryByText(profileViewText.pageTitle)).toEqual(null);
    })

    it("should make swipe", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);
        
        const afterSwipeFn = jest.fn();
        const profile = makePublicProfile("id");

        render(
            <StoreProvider value={store}>
                <ProfileViewMob
                    isInSwipeFeed={true}
                    afterSwipe={afterSwipeFn}
                    profile={profile}
                />
            </StoreProvider>
        );

        const likeButton = screen.getByTestId(testIDS.swipeLike);
        await act( () => {
            fireEvent(likeButton, "press");
        })

        expect(afterSwipeFn).toHaveBeenCalledTimes(1);
        
        const input = store.savedAPICalls.swipeInput;
        expect(input?.action).toEqual("Like");
        expect(input?.swipedUserID).toEqual(profile.id);
    })
})