import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { AccountCreation, pageOrder } from "../src/pages/AccountCreation"
import { myText } from "../src/text";
import { globals } from "../src/globals";
import { App, CustomApp, CustomAppDefault } from "../src/App";
import { GlobalState } from "../src/store/globalState";
import { RootStore } from "../src/store/RootStore";
import { UserInput } from "../src/interfaces";
import { action } from "mobx";

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

    it("should create userInput", async () => {
        const rootStore = new RootStore();
        rootStore.globalState.setEmail("a");
        rootStore.globalState.setUseHttp(false);

        const myName = "name";
        const myBirthday = new Date(2000,2,1);
        const myDescription = "description";
        const myGender = globals.genders[0]; 
        const myGenderPreference = [globals.genders[0], globals.genders[1]];
        const myAttributes = [
            globals.attributes.Music[1].value,
            globals.attributes.Sports[0].value
        ]

        const returnPageNumber = jest.fn((input : number) => input);

        render(<AccountCreation 
            rootStore={rootStore} 
            customBirthday={myBirthday}
            returnPageNumber={returnPageNumber}
        />);

        // create profile
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(1);

        //my name
        const nameInput = screen.getByPlaceholderText(myText.nameInputPlaceholder);
        await act( () => {
            fireEvent(nameInput, "changeText", myName);
        })
        await act( () => {
            fireEvent(nameInput, "submitEditing");
        })
        expect(returnPageNumber).toHaveLastReturnedWith(2);

        // birthday
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(3);

        // my gender
        await act( () => {
            fireEvent(screen.getByText(myGender),"press");
        })
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(4);

        // age preference
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(5);

        // gender preference
        for (const genderPrefer of myGenderPreference) {
            await act( () => {
                fireEvent(screen.getByText(genderPrefer), "press");
            })
        }
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(6);

        // pictures
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(7);

        // attributes
        for (const attribute of myAttributes) {
            await act( () => {
                fireEvent(screen.getByText(attribute), "press");
            })
        }
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(8);

        // description
        const descriptionInput = screen.getByPlaceholderText(
            myText.decsriptionPlaceholder
        );
        await act( () => {
            fireEvent(descriptionInput, "changeText", myDescription);
        })
        await act( () => {
            fireEvent(descriptionInput, "submitEditing");
        })
        expect(returnPageNumber).toHaveLastReturnedWith(9);


        //final
        await act( () => {
            fireEvent(screen.getByText(myText.continue), "press");
        })

        console.log(rootStore.globalState.userInput);

        // const userInput = rootStore.globalState.userInput;
        // console.log(userInput);


        // expect(userInput?.name).toEqual(myName);
        // expect(userInput?.birthday.getDate()).toEqual(myBirthday.getTime());
        // expect(userInput?.gender).toEqual(myGender);
        // expect(userInput?.ageInterest[0]).toEqual(globals.minAge);
        // expect(userInput?.ageInterest[1]).toEqual(globals.maxAge);
        // expect(userInput?.genderInterest).toHaveLength(2);
        // expect(userInput?.files).toHaveLength(0);
        // expect(userInput?.attributes).toHaveLength(2);
        // expect(userInput?.description).toEqual(myDescription);
    })
})