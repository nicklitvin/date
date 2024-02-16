import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { ChatMob } from "../src/pages/Chat";
import { PublicProfile } from "../src/interfaces";
import { chatText } from "../src/text";

describe("chat", () => {
    const myUserID = "userID";
    const recepientProfile : PublicProfile = {
        name: "Michael",
        age: 21,
        attributes: [],
        description: "",
        gender: "Male",
        id: "abc",
        images: ["imageURL"],
        university: "berkeley"
    }

    it("should send message", async () => {
        const store = new RootStore();
        store.globalState.setUserID(myUserID);
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob
                    publicProfile={recepientProfile}
                    latestMessages={[]}
                />
            </StoreProvider>
        );

        const myMessage = "hi";
        const myInput = screen.getByPlaceholderText(chatText.inputPlaceholder);
        await act( () => {
            fireEvent(myInput, "changeText", myMessage);
        })
        await act( () => {
            fireEvent(myInput, "submitEditing");
        })

        const sentMessage = store.globalState.sentMessage;
        expect(sentMessage?.message).toEqual(myMessage);
        expect(sentMessage?.userID).toEqual(myUserID);
        expect(sentMessage?.recepientID).toEqual(recepientProfile.id);
    })

    it("should load more messages", async () => {

    })
})