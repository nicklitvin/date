import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { AccountCreation, pageOrder } from "../src/pages/AccountCreation"
import { accountCreationText } from "../src/text";
import { globals } from "../src/globals";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { FileUploadAndURI } from "../src/interfaces";

describe("accountCreation", () => {
    it("should continue to next page", async () => {
        const store = new RootStore()
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <AccountCreation/>
            </StoreProvider>
        );

        expect(screen.queryByText(accountCreationText.createProfileTitle)).not.toEqual(null);
        const continueButton = screen.getByText(accountCreationText.continue);
        await act( () => {
            fireEvent(continueButton, "press")
        });
        expect(screen.queryByText(accountCreationText.nameInputTitle)).not.toEqual(null);
    })

    it("should not continue if gender not selected", async () => {
        const pageStart = pageOrder.findIndex(page => page == "Gender") as number;
        const store = new RootStore()
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <AccountCreation customPageStart={pageStart}/>
            </StoreProvider>
        );

        expect(screen.queryByText(accountCreationText.genderInputTitle)).not.toEqual(null);
        const continueButton = screen.getByText(accountCreationText.continue);
        await act( () => {
            fireEvent(continueButton, "press");
        })

        expect(screen.queryByText(accountCreationText.genderInputTitle)).not.toEqual(null);
    })

    it("should unselect gender", async () => {
        const pageStart = pageOrder.findIndex(page => page == "Gender") as number;
        const store = new RootStore()
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <AccountCreation customPageStart={pageStart}/>
            </StoreProvider>
        );

        const genderButton = screen.getByText(globals.genders[0]);
        const continueButton = screen.getByText(accountCreationText.continue);
        await act( () => {
            fireEvent(genderButton, "press")
            fireEvent(genderButton, "press")
            fireEvent(continueButton, "press")
        })
    
        expect(screen.queryByText(accountCreationText.genderInputTitle)).not.toEqual(null);
    })

    it("should generate all attributes", async () => {
        const pageStart = pageOrder.findIndex(page => page == "Attributes") as number;
        const store = new RootStore()
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <AccountCreation customPageStart={pageStart}/>
            </StoreProvider>
        );

        for (const entry of Object.entries(globals.attributes)) {
            expect(screen.queryByText(entry[0])).not.toEqual(null);
            for (const attribute of entry[1]) {
                expect(screen.queryByText(attribute.value)).not.toEqual(null);
            }
        }
    })

    it("should create userInput", async () => {
        const store = new RootStore()
        store.globalState.setUseHttp(false);
        store.globalState.setEmail("email");
        const StoreProvider = createStoreProvider(store);

        const myName = "name";
        const myBirthday = new Date(2000,2,1);
        const myDescription = "description";
        const myGender = globals.genders[0]; 
        const myGenderPreference = [globals.genders[0], globals.genders[1]];
        const customUploads : FileUploadAndURI[] = [{
            buffer: Buffer.from("a"),
            mimetype: "image/jpeg",
            uri: "file://random"
        }];
        const myAttributes = [
            globals.attributes.Music[1].value,
            globals.attributes.Sports[0].value
        ]

        const returnPageNumber = jest.fn((input : number) => input);

        render(
            <StoreProvider value={store}>
                <AccountCreation 
                    customBirthday={myBirthday}
                    customUploads={customUploads}
                    returnPageNumber={returnPageNumber}
                />
            </StoreProvider>
        );

        // create profile
        await act( () => {
            fireEvent(screen.getByText(accountCreationText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(1);

        //my name
        const nameInput = screen.getByPlaceholderText(accountCreationText.nameInputPlaceholder);
        await act( () => {
            fireEvent(nameInput, "changeText", myName);
        })
        await act( () => {
            fireEvent(nameInput, "submitEditing");
        })
        expect(returnPageNumber).toHaveLastReturnedWith(2);

        // birthday
        await act( () => {
            fireEvent(screen.getByText(accountCreationText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(3);

        // my gender
        await act( () => {
            fireEvent(screen.getByText(myGender),"press");
        })
        await act( () => {
            fireEvent(screen.getByText(accountCreationText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(4);

        // age preference
        await act( () => {
            fireEvent(screen.getByText(accountCreationText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(5);

        // gender preference
        for (const genderPrefer of myGenderPreference) {
            await act( () => {
                fireEvent(screen.getByText(genderPrefer), "press");
            })
        }
        await act( () => {
            fireEvent(screen.getByText(accountCreationText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(6);

        // pictures
        await act( () => {
            fireEvent(screen.getByText(accountCreationText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(7);

        // attributes
        for (const attribute of myAttributes) {
            await act( () => {
                fireEvent(screen.getByText(attribute), "press");
            })
        }
        await act( () => {
            fireEvent(screen.getByText(accountCreationText.continue), "press")
        })
        expect(returnPageNumber).toHaveLastReturnedWith(8);

        // description
        const descriptionInput = screen.getByPlaceholderText(
            accountCreationText.decsriptionPlaceholder
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
            fireEvent(screen.getByText(accountCreationText.continue), "press");
        })

        const userInput = store.globalState.userInput;

        expect(userInput?.name).toEqual(myName);
        expect(userInput?.birthday.getTime()).toEqual(myBirthday.getTime());
        expect(userInput?.gender).toEqual(myGender);
        expect(userInput?.ageInterest[0]).toEqual(globals.minAge);
        expect(userInput?.ageInterest[1]).toEqual(globals.maxAge);
        expect(userInput?.genderInterest).toHaveLength(2);
        expect(userInput?.files).toHaveLength(1);
        expect(userInput?.attributes).toHaveLength(2);
        expect(userInput?.description).toEqual(myDescription);
    })

    it("should switch images", async () => {
        const store = new RootStore()
        store.globalState.setUseHttp(false);
        store.globalState.setEmail("email");
        const StoreProvider = createStoreProvider(store);
        const pageStart = pageOrder.findIndex(page => page == "Pictures") as number;

        const imageURI = "a";
        const imageURI_2 = "b";
        const fileUploads : FileUploadAndURI[] = [
            {
                buffer: Buffer.from("a"),
                mimetype: "image/jpeg",
                uri: imageURI
            },
            {
                buffer: Buffer.from("b"),
                mimetype: "image/jpeg",
                uri: imageURI_2
            }
        ]
        const returnFileOrder = jest.fn((input : string[]) => 
            input.reduce( (prev : string, curr : string) => {
                return prev + curr
            }, "")
        );


        render(
            <StoreProvider value={store}>
                <AccountCreation 
                    customPageStart={pageStart}
                    customUploads={fileUploads}
                    returnUploadOrder={returnFileOrder}
                />
            </StoreProvider>
        );

        const switchButton = screen.getByText(accountCreationText.uploadSwitch);

        await act( () => {
            fireEvent(switchButton, "press");
        })
        const image1 = screen.getByTestId(`image-${imageURI}`);
        const image2 = screen.getByTestId(`image-${imageURI_2}`);
        await act( () => {
            fireEvent(image1, "press");
        })
        await act( () => {
            fireEvent(image2, "press");
        })
        expect(returnFileOrder).toHaveLastReturnedWith(`${imageURI_2}${imageURI}`)
    })
})