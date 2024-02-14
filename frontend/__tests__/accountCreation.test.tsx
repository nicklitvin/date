import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { AccountCreation } from "../src/pages/AccountCreation"
import { myText } from "../src/text";

describe("accountCreation", () => {
    it("should continue to next page", async () => {
        render(<AccountCreation/>);
        expect(screen.queryByText(myText.createProfileTitle)).not.toEqual(null);
        const continueButton = screen.getByText(myText.continue);
        await act( () => {
            fireEvent(continueButton, "press")
        });
        expect(screen.queryByText(myText.nameInputTitle)).not.toEqual(null);
    })
})