import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { FeedMob } from "../src/pages/Feed";
import { PublicProfile } from "../src/interfaces";
import { makePublicProfile } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";

describe("feed", () => {
    const feed : PublicProfile[] = [
        makePublicProfile("id"),
        makePublicProfile("id1"),
        makePublicProfile("id2"),
    ]

    it("should go to next person", async () => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.makeSwipe).reply( config => [200]);

        const getFeedIndex = jest.fn( (input : number) => input);
        render(
            <FeedMob
                feed={feed}
                returnFeedIndex={getFeedIndex}
            />
        )

        expect(getFeedIndex).toHaveLastReturnedWith(0);

        const likeButton = screen.getByTestId(testIDS.swipeLike);
        await act( () => {
            fireEvent(likeButton, "press")
        });

        expect(getFeedIndex).toHaveLastReturnedWith(1);
    })

    it("should show not load more users if none", async () => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getFeed).reply( config => {
            console.log("no");
            return [200, {data: feed}]
        })
        
        render(
            <FeedMob
                feed={[]}
            />
        )
    })

    it("should load more users", async () => {
        const initialFeed : PublicProfile[] = [feed[0]];
        const moreFeed : PublicProfile[] = [feed[1],feed[2]]
        
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getFeed).reply( config => {
            return [200, {data: moreFeed}]
        })
        mock.onPost(URLs.server + URLs.makeSwipe).reply( config => {
            return [200]
        })
        
        const getFeedLength = jest.fn( (input : number) => input);
        render(
            <FeedMob
                feed={initialFeed}
                returnFeedLength={getFeedLength}
            />
        )

        expect(getFeedLength).toHaveLastReturnedWith(1);

        const likeButton = screen.getByTestId(testIDS.swipeLike);
        await act( () => {
            fireEvent(likeButton,"press");
        })

        expect(getFeedLength).toHaveLastReturnedWith(3);
    })
})