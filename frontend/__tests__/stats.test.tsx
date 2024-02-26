import { render, screen } from "@testing-library/react-native"
import { Stats } from "../src/pages/Stats"
import { statsText } from "../src/text"

describe("stats", () => {
    it("should not render stats if none", async () => {
        render( 
            <Stats/>
        )

        expect(screen.queryByText(statsText.purchaseButton)).not.toEqual(null);
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