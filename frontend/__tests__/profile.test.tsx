import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import { URLs } from "../src/urls";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ProfileMob } from "../app/(tabs)/Profile";
import { profileText } from "../src/text";
import { PublicProfile, SubscriptionData } from "../src/interfaces";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { testIDS } from "../src/testIDs";

describe("profile page", () => {
    const profile : PublicProfile = {
        id: "a",
        age: 20,
        attributes: [],
        description: "",
        gender: "Male",
        images: [{
            id: "image-id",
            url: "image"
        }],
        name: "name",
        alcohol: "Often",
        smoking: "Often"
    }

    const subscriptionData : SubscriptionData = {
        subscribed: true,
        endDate: new Date(),
        ID: "id"
    }

    const notSubscribedData : SubscriptionData = {
        subscribed: false,
    }

    const cancelURL = "cancelURL";
    const manageURL = "manageURL";
    const checkoutURL = "checkoutURL";

    const load = async (subscribed : boolean, useSave = false) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getMyProfile).reply( config => 
            [200, {data: profile}]    
        )
        mock.onPost(URLs.server + URLs.getSubscription).reply( config => 
            [200, {data: subscribed ? subscriptionData : notSubscribedData} ]
        )
        mock.onPost(URLs.server + URLs.cancelSubscription).reply(config => 
            [200, {data: cancelURL}]
        )
        mock.onPost(URLs.server + URLs.manageSubscription).reply(config => 
            [200, {data: manageURL}]
        )
        mock.onPost(URLs.server + URLs.getCheckoutPage).reply(config => 
            [200, {data: checkoutURL}]
        )

        const store = new RootStore();
        const StoreProvider = createStoreProvider(store);
        const openLinkFunc = jest.fn();

        if (useSave) {
            store.receivedData.setProfile(profile);
            store.receivedData.setSubscription(
                subscribed ? subscriptionData : notSubscribedData
            )
        }

        render(
            <StoreProvider value={store}>
                <ProfileMob
                    dontAutoLoad={true}
                    openLinkFunc={openLinkFunc}
                />
            </StoreProvider>
        )

        if (!useSave) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.load), "press")
            });
        }
        
        return { store, mock, openLinkFunc }
    }

    it("should render subscribed view", async () => {
        const { store, openLinkFunc } = await load(true);

        expect(store.receivedData.subscription?.subscribed).toEqual(true);

        await act( () => {
            fireEvent(screen.getByText(profileText.managePayment), "press")
        });

        expect(openLinkFunc).toHaveBeenLastCalledWith(manageURL);
        expect(screen.queryByText(profileText.cancelSubscription)).not.toEqual(null);
    })

    it("should show not subscribed view", async () => {
        const { openLinkFunc } = await load(false);

        await act( () => {
            fireEvent(screen.getByText(profileText.purchasePremium), "press")
        });

        expect(openLinkFunc).toHaveBeenLastCalledWith(checkoutURL);
    })

    it("should load saved data", async () => {
        await load(true, true);

        expect(screen.queryByText(profileText.cancelSubscription)).not.toEqual(null);
    })
})