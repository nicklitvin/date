import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { Preferences } from "../src/pages/Preferences"
import { globals } from "../src/globals";
import { generalText } from "../src/text";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { EditUserInput } from "../src/interfaces";

describe("preferences", () => {
    it("should change preferences", async () => {
        let sent = false;
        const selectedGender = globals.genders[0];

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.editUser).reply(config => {
            const payload = JSON.parse(config.data) as EditUserInput;
            if (payload.setting == globals.settingGenderPreference) {
                expect(payload.value).toHaveLength(1);
                expect(payload.value[0]).toEqual(selectedGender)
            } 
            sent = true;
            return [200]
        })

        render(
            <Preferences
                agePreference={[20,30]}
                genderPreference={[]}
            />
        );

        await act( () => {
            fireEvent(screen.getByText(selectedGender), "press")
        });

        await act( () => {
            fireEvent(screen.getByText(generalText.saveChanges), "press")
        })
        
        expect(sent).toEqual(true);
    })
})