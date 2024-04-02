import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { EditUserInput, SettingData } from "../src/interfaces"
import { RootStore, createStoreProvider } from "../src/store/RootStore"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import { URLs } from "../src/urls"
import { settingsText } from "../src/text"
import SettingsMob from "../app/Settings"
import { testIDS } from "../src/testIDs"

describe("settings", () => {
    const settingData : SettingData[] = [
        {
            title: "title",
            value: true
        },
        {
            title: "title2",
            value: false
        }
    ]

    const load = async (useSave = false) => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getSettings).reply( config => 
            [200, {data: settingData}]
        )


        const store = new RootStore();
        if (useSave) {
            store.receivedData.setSettings(settingData);
        }
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <SettingsMob 
                    disableToggle={true}    
                    noAutoLoad={true}
                />
            </StoreProvider>
        )

        if (!useSave) {
            await act( () => {
                fireEvent(screen.getByTestId(testIDS.load), "press");
            })
        }

        return { store, mock }
    }

    it("should load settings", async () => {
        const { store } = await load();

        for (const setting of settingData) {
            expect(screen.queryByText(setting.title)).not.toEqual(null);
        }

        expect(store.receivedData.settings).toHaveLength(settingData.length);
    })

    it("should load saved settings", async () => {
        await load(true);

        for (const setting of settingData) {
            expect(screen.queryByText(setting.title)).not.toEqual(null);
        }
    })

    it("should delete account", async () => {
        const { store, mock } = await load();
        let sentDelete = false;

        mock.onPost(URLs.server + URLs.deleteAccount).reply(config => {
            sentDelete = true;
            return [200]
        })

        await act( () => {
            fireEvent(screen.getByText(settingsText.deleteAccount), "press")
        });
        await act( () => {
            fireEvent(screen.getByText(settingsText.modalDelete), "press");
        })

        expect(store.receivedData.profile).toEqual(null);
        expect(sentDelete).toEqual(true);
    })

    it("should sign out", async () => {
        const { store } = await load();

        await act( () => {
            fireEvent(screen.getByText(settingsText.signOut), "press")
        });

        expect(store.receivedData.profile).toEqual(null);
    })

    it("should edit user", async () => {
        const { store, mock } = await load();
        let sentEdit = false;

        mock.onPost(URLs.server + URLs.editUser).reply( config => {
            sentEdit = true;
            const payload = JSON.parse(config.data) as EditUserInput;
            expect(payload.setting).toEqual(settingData[0].title);
            expect(payload.value).toEqual(!settingData[0].value);
            return [200]
        })

        await act( () => {
            fireEvent(screen.getByTestId(`toggle-${settingData[0].title}`), "press")
        })

        expect(sentEdit).toEqual(true);
    })
})