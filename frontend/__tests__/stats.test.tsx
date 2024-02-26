import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { Stats } from "../src/pages/Stats"
import { statsText } from "../src/text"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import { URLs } from "../src/urls"

describe("stats", () => {
    it("should purchase premium if no stats", async () => {
        const checkoutURL = "url";

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getCheckoutPage).reply( config => [200, checkoutURL])
        
        const openLinkFunc = jest.fn( (input : string) => null)
        render( 
            <Stats
                openLinkFunc={openLinkFunc}
            />
        )

        await act( () => {
            fireEvent(screen.getByText(statsText.purchaseButton), "press");
        })

        expect(openLinkFunc).toHaveBeenLastCalledWith(checkoutURL);

    })

    it("should render stats", async () => {
        render(
            <Stats
                stats={{
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
                }}
            />
        );
        expect(screen.queryByText(statsText.purchaseButton)).toEqual(null);
    })
})