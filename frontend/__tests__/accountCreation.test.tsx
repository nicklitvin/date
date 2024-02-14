import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { AccountCreation, pageOrder } from "../src/pages/AccountCreation"
import { myText } from "../src/text";
import { globals } from "../src/globals";

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

    it("should not continue if gender not selected", async () => {
        const pageStart = pageOrder.findIndex(page => page == "Gender") as number;
        render(<AccountCreation customPageStart={pageStart}/>);

        expect(screen.queryByText(myText.genderInputTitle)).not.toEqual(null);
        const continueButton = screen.getByText(myText.continue);
        await act( () => {
            fireEvent(continueButton, "press");
        })

        expect(screen.queryByText(myText.genderInputTitle)).not.toEqual(null);
    })

    it("should unselect gender", async () => {
        const pageStart = pageOrder.findIndex(page => page == "Gender") as number;
        render(<AccountCreation customPageStart={pageStart}/>);

        const genderButton = screen.getByText(globals.genders[0]);
        const continueButton = screen.getByText(myText.continue);
        await act( () => {
            fireEvent(genderButton, "press")
            fireEvent(genderButton, "press")
            fireEvent(continueButton, "press")
        })
    
        expect(screen.queryByText(myText.genderInputTitle)).not.toEqual(null);
    })

    it("should generate all attributes", async () => {
        const pageStart = pageOrder.findIndex(page => page == "Attributes") as number;
        render(<AccountCreation customPageStart={pageStart}/>);

        for (const entry of Object.entries(globals.attributes)) {
            expect(screen.queryByText(entry[0])).not.toEqual(null);
            for (const attribute of entry[1]) {
                expect(screen.queryByText(attribute.value)).not.toEqual(null);
            }
        }
    })
})