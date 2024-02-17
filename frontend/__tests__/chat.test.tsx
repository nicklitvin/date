import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { ChatMob } from "../src/pages/Chat";
import { Message, PublicProfile } from "../src/interfaces";
import { chatText } from "../src/text";
import { testIDS } from "../src/testIDs";

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
    const latestMessages : Message[] = [
        {
            id: "id",
            message: "hi",
            readStatus: true,
            recepientID: recepientProfile.id,
            timestamp: new Date(1),
            userID: myUserID
        },
        {
            id: "id1",
            message: "hey",
            readStatus: true,
            recepientID: myUserID,
            timestamp: new Date(2),
            userID: recepientProfile.id
        }
    ]
    const moreMessages : Message[] = [
        latestMessages[1],
        {
            id: "id3",
            message: "sooo",
            readStatus: false,
            recepientID: recepientProfile.id,
            timestamp: new Date(2),
            userID: myUserID
        } 
    ]

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

    it("should load older messages", async () => {
        const store = new RootStore();
        store.globalState.setUserID(myUserID);
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);
        const getChatLength = jest.fn( (input) => input);

        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                    customNextChatLoad={moreMessages}
                    customGetChatLength={getChatLength}
                />
            </StoreProvider>
        );

        expect(getChatLength).toHaveLastReturnedWith(2);

        const scroll = screen.getByTestId(testIDS.chatScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop")
        })

        expect(getChatLength).toHaveLastReturnedWith(3);
    })
})