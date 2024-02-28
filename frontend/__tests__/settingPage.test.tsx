import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { EditUserInput, SettingData } from "../src/interfaces"
import { SettingsMob } from "../src/pages/Settings"
import { RootStore, createStoreProvider } from "../src/store/RootStore"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import { URLs } from "../src/urls"
import { settingsText } from "../src/text"

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

    it("temporary", async () => {})
    
    // it("should show all settings", async () => {
    //     const store = new RootStore();
    //     store.globalState.setEmail("a");
    //     const StoreProvider = createStoreProvider(store);

    //     render(
    //         <StoreProvider value={store}>
    //             <SettingsMob
    //                 settings={settingData}
    //             />
    //         </StoreProvider>
    //     );

    //     for (const setting of settingData) {
    //         expect(screen.queryByText(setting.title)).not.toEqual(null);
    //     }
    // });

    // it("should sign out", async () => {
    //     const store = new RootStore();
    //     store.globalState.setEmail("a");
    //     const StoreProvider = createStoreProvider(store);

    //     render(
    //         <StoreProvider value={store}>
    //             <SettingsMob
    //                 settings={settingData}
    //             />
    //         </StoreProvider>
    //     );

    //     await act( () => {
    //         fireEvent(screen.getByText(settingsText.signOut), "press")
    //     });

    //     expect(store.globalState.email).toEqual(null);
    // })

    // it("should delete account", async () => {
    //     let sent = false;

    //     const mock = new MockAdapter(axios);
    //     mock.onPost(URLs.server + URLs.deleteAccount).reply(config => {
    //         sent = true;
    //         return [200]
    //     })
  
    //     const store = new RootStore();
    //     store.globalState.setEmail("a");
    //     const StoreProvider = createStoreProvider(store);
    //     render(
    //         <StoreProvider value={store}>
    //             <SettingsMob
    //                 settings={settingData}
    //             />
    //         </StoreProvider>
    //     );

    //     await act( () => {
    //         fireEvent(screen.getByText(settingsText.deleteAccount), "press")
    //     });

    //     expect(store.globalState.email).toEqual(null);
    //     expect(sent).toEqual(true);
    // })

    // it("should edit user", async () => {
    //     let sent = false;

    //     const mock = new MockAdapter(axios);
    //     mock.onPost(URLs.server + URLs.editUser).reply(config => {
    //         const payload = JSON.parse(config.data) as EditUserInput;
    //         expect(payload.setting).toEqual(settingData[0].title);
    //         expect(payload.value).toEqual(!settingData[0].value);
    //         sent = true;
    //         return [200]
    //     })

    //     const store = new RootStore();
    //     store.globalState.setEmail("a");
    //     const StoreProvider = createStoreProvider(store);
    //     render(
    //         <StoreProvider value={store}>
    //             <SettingsMob settings={settingData}/>
    //         </StoreProvider>
    //     );

    //     await act( () => {
    //         fireEvent(screen.getByTestId(`toggle-${settingData[0].title}`), "press")
    //     })

    //     expect(sent).toEqual(true);
    // })
})