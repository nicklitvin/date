import { act, fireEvent, render, screen } from "@testing-library/react-native"
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import PreferencesMob from "../app/Preferences";
import { testIDS } from "../src/testIDs";
import { EditUserInput, Preferences } from "../src/interfaces";
import { URLs } from "../src/urls";
import { globals } from "../src/globals";
import { generalText } from "../src/text";

describe("preferences", () => {
    const initial : Preferences = {
        agePreference: [20,30],
        genderPreference: [globals.genders[0]]
    }

    const load = async (useSave = false) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getPreferences).reply(config => 
            [200, {data: initial}]
        )

        const store = new RootStore();
        if (useSave) {
            store.receivedData.setPreferences(initial);
        }
        const StoreProvider = createStoreProvider(store);
        const returnGenders = jest.fn();
        const returnMinAge = jest.fn();
        const returnMaxAge = jest.fn();

        render(
            <StoreProvider value={store}>
                <PreferencesMob
                    noAutoLoad={true}
                    returnGenderCount={returnGenders}
                    returnMaxAge={returnMaxAge}
                    returnMinAge={returnMinAge}
                />
            </StoreProvider>
        )

        if (!useSave) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.load), "press");
            })
        }

        return { store, mock, returnGenders, returnMinAge, returnMaxAge }
    }

    it("should load preferences", async () => {
        const { store, returnGenders, returnMinAge, returnMaxAge } = await load();

        const preferences = store.receivedData.preferences;
        expect(preferences?.genderPreference).toHaveLength(initial.genderPreference.length);
        expect(preferences?.agePreference[0]).toEqual(initial.agePreference[0]);
        expect(preferences?.agePreference[1]).toEqual(initial.agePreference[1]);

        expect(returnGenders).toHaveBeenLastCalledWith(initial.genderPreference.length);
        expect(returnMinAge).toHaveBeenLastCalledWith(initial.agePreference[0]);
        expect(returnMaxAge).toHaveBeenLastCalledWith(initial.agePreference[1]);
    })

    it("should load saved preferences", async () => {
        const { returnGenders, returnMinAge, returnMaxAge } = await load(true);

        expect(returnGenders).toHaveBeenLastCalledWith(initial.genderPreference.length);
        expect(returnMinAge).toHaveBeenLastCalledWith(initial.agePreference[0]);
        expect(returnMaxAge).toHaveBeenLastCalledWith(initial.agePreference[1]);
    })

    it("should change preferences", async () => {
        let sent = false;
        const selectedGender = globals.genders[1];

        const { mock, store } = await load();
        mock.onPost(URLs.server + URLs.editUser).reply(config => {
            const payload = JSON.parse(config.data) as EditUserInput;
            if (payload.setting == globals.settingGenderPreference) {
                expect(payload.value).toHaveLength(2);
                expect(payload.value[0]).toEqual(initial.genderPreference[0])
                expect(payload.value[1]).toEqual(selectedGender)
            } 
            sent = true;
            return [200]
        })

        await act( () => {
            fireEvent(screen.getByText(selectedGender), "press")
        });

        await act( () => {
            fireEvent(screen.getByText(generalText.saveChanges), "press")
        })
        
        expect(sent).toEqual(true);
        expect(store.receivedData.preferences?.genderPreference).toHaveLength(2);
    })

    it("should show save text if new changes", async () => {
        const {} = await load();

        expect(screen.getByText(generalText.saved)).not.toEqual(null);

        await act ( () => {
            fireEvent(screen.getByText(globals.genders[0]), "press")
        });

        expect(screen.getByText(generalText.saveChanges)).not.toEqual(null);
    })

    it("should not save if no gender selected", async () => {
        const {} = await load();

        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.editUser).reply(config => {
            sent = true;
            return [200]
        })

        await act ( () => {
            fireEvent(screen.getByText(initial.genderPreference[0]), "press")
        });
        await act( () => {
            fireEvent(screen.getByText(generalText.saveChanges), "press")
        })

        expect(screen.queryByText(generalText.saved)).toEqual(null);
        expect(sent).toEqual(false);
    })
})