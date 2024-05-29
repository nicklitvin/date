import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { birthdayText, genderText, generalText, pictureText } from "../src/text";
import { globals } from "../src/globals";
import { AttributesPage } from "../src/pages/Attributes";
import { Gender } from "../src/simplePages/Gender";
import { Birthday } from "../src/simplePages/Birthday";
import { GenderPreference } from "../src/simplePages/GenderPreference";
import { Pictures } from "../src/simplePages/Pictures";
import { receivedAttributes } from "../__testUtils__/easySetup";

describe("test pages", () => {
    it("should not continue if not enough upload", async () => {
        const onSubmit = jest.fn();
        render(
            <Pictures
                onSubmit={onSubmit}
                submitText={generalText.continue}
                uploads={[]}
            />
        );

        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press");
        })

        expect(onSubmit).toHaveBeenCalledTimes(0);
    })

    it("should generate all attributes", async () => {
        render(
            <AttributesPage
                attributes={receivedAttributes}
                onSubmit={jest.fn()}
                submitText="submit"
            />
        );

        for (const entry of Object.entries(receivedAttributes)) {
            expect(screen.queryByText(entry[0])).not.toEqual(null);
            for (const value of entry[1]) {
                expect(screen.queryByText(value)).not.toEqual(null);
            }
        }
    })

    it("should not continue if gender not selected", async () => {
        const onSubmit = jest.fn();
        render(
            <Gender
                genders={globals.genders}
                onSubmit={onSubmit}
                submitText={generalText.continue}  
            />
        );

        expect(screen.queryByText(genderText.pageTitle)).not.toEqual(null);
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press");
        })

        expect(onSubmit).toHaveBeenCalledTimes(0);
    })

    it("should submit myDateInput", async () => {
        const onSubmit = jest.fn( (input : Date) => input);
        const chosenDate = new Date(2000,0,1);

        render(<Birthday
            submitText={generalText.continue}
            onSubmit={onSubmit}
            customBirthday={chosenDate}
        />)

        const continueButton = screen.getByText(generalText.continue);
        await act( () => {
            fireEvent(continueButton, "press");
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveLastReturnedWith(chosenDate)
    })

    it("should unselect gender", async () => {
        const onSubmit = jest.fn();
        render(
            <Gender
                genders={globals.genders}
                onSubmit={onSubmit}
                submitText={generalText.continue}
            />
        );

        const genderButton = screen.getByText(globals.genders[0]);
        await act( () => {
            fireEvent(genderButton, "press")
        })
        await act( () => {
            fireEvent(genderButton, "press")
        })
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
    
        expect(onSubmit).toHaveBeenCalledTimes(0);
    })
})