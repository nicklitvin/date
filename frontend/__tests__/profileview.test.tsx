import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ProfileViewMob } from "../src/pages/ProfileView";
import { makePublicProfile } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";
import { profileViewText } from "../src/text";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { SwipeInput } from "../src/interfaces";

describe("profileview", () => {
    it("should render not swipe version", async () => {
        const profile = makePublicProfile("id");

        render(
            <ProfileViewMob
                isInSwipeFeed={false}
                profile={profile}
            />
        )

        expect(screen.queryByTestId(testIDS.swipeLike)).toEqual(null);
        expect(screen.queryByTestId(testIDS.swipeDislike)).toEqual(null);
        expect(screen.queryByText(profileViewText.pageTitle)).not.toEqual(null);
    })

    it("should render swipe version", async () => {
        const profile = makePublicProfile("id");
        render(
            <ProfileViewMob
                isInSwipeFeed={true}
                profile={profile}
            />
        )

        expect(screen.queryByTestId(testIDS.swipeLike)).not.toEqual(null);
        expect(screen.queryByTestId(testIDS.swipeDislike)).not.toEqual(null);
        expect(screen.queryByText(profileViewText.pageTitle)).toEqual(null);
    })

    it("should make swipe", async () => {
        const profile = makePublicProfile("id");
        let swipeMade = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.makeSwipe).reply( config => {
            const payload = JSON.parse(config.data) as SwipeInput;
            expect(payload.action).toEqual("Like");
            expect(payload.swipedUserID).toEqual(profile.id);
            swipeMade = true;
            return [200]
        })

        const afterSwipeFn = jest.fn();
        render(
            <ProfileViewMob
                isInSwipeFeed={true}
                afterSwipe={afterSwipeFn}
                profile={profile}
            />
        );

        const likeButton = screen.getByTestId(testIDS.swipeLike);
        await act( () => {
            fireEvent(likeButton, "press");
        })

        expect(afterSwipeFn).toHaveBeenCalledTimes(1);
        expect(swipeMade).toEqual(true);
    })
})