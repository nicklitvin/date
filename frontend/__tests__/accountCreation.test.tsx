import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { createProfileText, descriptionText, generalText, myNameText } from "../src/text";
import { globals } from "../src/globals";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { UploadImageInputWithURI, UserInputWithFiles } from "../src/interfaces";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import AccountCreationMob from "../app/AccountCreation";
import { receivedAttributes } from "../__testUtils__/easySetup";

describe("accountCreation", () => {
    it("should continue to next page", async () => {
        const store = new RootStore()
        store.receivedData.setAttributes(receivedAttributes);
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <AccountCreationMob/>
            </StoreProvider>
        );

        expect(screen.queryByText(createProfileText.pageTitle)).not.toEqual(null);
        const continueButton = screen.getByText(generalText.continue);
        await act( () => {
            fireEvent(continueButton, "press")
        });
        expect(screen.queryByText(myNameText.pageTitle)).not.toEqual(null);
    })

    it("should create userInput", async () => {
        const store = new RootStore()
        store.receivedData.setAttributes(receivedAttributes);

        const myName = "name";
        const myBirthday = new Date(2000,2,1);
        const myDescription = "description";
        const myGender = globals.genders[0]; 
        const myGenderPreference = [globals.genders[0], globals.genders[1]];
        const customUploads : UploadImageInputWithURI[] = [{
            image: {
                content: "a",
                mimetype: "iamge/jpeg"
            },
            uri: "file://random"
        }];
        const myAttributes = [
            receivedAttributes["music"][0],
            receivedAttributes["sports"][0]
        ]
        const alcoholFreq = globals.frequencies[1];
        const smokingFreq = globals.frequencies[2];

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.createUser).reply( config => {
            const userInput = JSON.parse(config.data) as UserInput;
            expect(userInput?.name).toEqual(myName);
            expect(new Date(userInput?.birthday).getTime()).toEqual(myBirthday.getTime());
            expect(userInput?.gender).toEqual(myGender);
            expect(userInput?.ageInterest[0]).toEqual(globals.minAge);
            expect(userInput?.ageInterest[1]).toEqual(globals.maxAge);
            expect(userInput?.genderInterest).toHaveLength(2);
            expect(userInput?.files).toHaveLength(1);
            expect(userInput?.attributes).toHaveLength(2);
            expect(userInput?.description).toEqual(myDescription);
            expect(userInput?.alcohol).toEqual(alcoholFreq);
            expect(userInput?.smoking).toEqual(smokingFreq);
            
            return [200]
        })


        const returnPageNumber = jest.fn((input : number) => input);
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <AccountCreationMob 
                    customBirthday={myBirthday}
                    customUploads={customUploads}
                    returnPageNumber={returnPageNumber}
                    noRouter={true}
                />
            </StoreProvider>
        );

        let pageNumber = 0;
        // create profile
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        //my name
        const nameInput = screen.getByPlaceholderText(myNameText.inputPlaceholder);
        await act( () => {
            fireEvent(nameInput, "changeText", myName);
        })
        await act( () => {
            fireEvent(nameInput, "submitEditing");
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // birthday
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // my gender
        await act( () => {
            fireEvent(screen.getByText(myGender),"press");
        })
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // alcohol 
        await act( () => {
            fireEvent(screen.getByText(alcoholFreq), "press")
        })
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // smoking
        await act( () => {
            fireEvent(screen.getByText(smokingFreq), "press")
        })
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // age preference
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // gender preference
        for (const genderPrefer of myGenderPreference) {
            await act( () => {
                fireEvent(screen.getByText(genderPrefer), "press");
            })
        }
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // pictures
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // attributes
        for (const attribute of myAttributes) {
            await act( () => {
                fireEvent(screen.getByText(attribute), "press");
            })
        }
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        // description
        const descriptionInput = screen.getByPlaceholderText(
            descriptionText.inputPlaceholder
        );
        await act( () => {
            fireEvent(descriptionInput, "changeText", myDescription);
        })
        await act( () => {
            fireEvent(descriptionInput, "submitEditing");
        })
        expect(returnPageNumber).toHaveLastReturnedWith(pageNumber + 1);
        pageNumber += 1;

        //final
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press");
        })
    })
})