import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import { URLs } from "../src/urls";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ProfileMob } from "../src/pages/Profile";
import { profileText } from "../src/text";
import { PublicProfile, SubscriptionData } from "../src/interfaces";

describe("profile", () => {
    const profile : PublicProfile = {
        id: "a",
        age: 20,
        attributes: [],
        description: "",
        gender: "Male",
        images: ["image"],
        name: "name"
    }

    const subscriptionData : SubscriptionData = {
        subscribed: true,
        endDate: new Date(),
        ID: "id"
    }

    const notSubscribedData : SubscriptionData = {
        subscribed: false,
    }

    it("should purchase if not subscribed", async () => {
        const checkoutURL = "url";

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getCheckoutPage).reply( config => [200, checkoutURL])

        const openLinkFunc = jest.fn( (input : string) => null)
        render( 
            <ProfileMob
                profile={profile}
                subscription={notSubscribedData}
                openLinkFunc={openLinkFunc}
            />
        )

        await act( () => {
            fireEvent(screen.getByText(profileText.purchasePremium), "press");
        })

        expect(openLinkFunc).toHaveBeenLastCalledWith(checkoutURL);
    })

    it("should not see cancel subscription", async () => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.cancelSubscription).reply( config => [200])

        render(
            <ProfileMob
                profile={profile}
                subscription={notSubscribedData}
            />
        );

        expect(screen.queryByText(profileText.freeTier)).not.toEqual(null);
        expect(screen.queryByText(profileText.cancelSubscription)).toEqual(null);
    })

    it("should cancel subscription", async () => {
        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.cancelSubscription).reply( config => {
            sent = true;
            return [200]
        })

        render(
            <ProfileMob
                profile={profile}
                subscription={subscriptionData}
            />
        );

        await act( () => {
            fireEvent(screen.getByText(profileText.cancelSubscription), "press")
        })

        expect(screen.queryByText(profileText.premiumTier)).not.toEqual(null);
        expect(sent).toEqual(true);
    })

    it("should get management page", async () => {
        const manageURL = "url";

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.manageSubscription).reply( config => [200, manageURL])

        const openLinkFunc = jest.fn( (input : string) => null)
        render(
            <ProfileMob
                profile={profile}
                subscription={subscriptionData}
                openLinkFunc={openLinkFunc}
            />
        );

        await act( () => {
            fireEvent(screen.getByText(profileText.managePayment), "press")
        })

        expect(openLinkFunc).toHaveBeenLastCalledWith(manageURL);
    })
})