import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { ChatMob } from "../src/pages/Chat";
import { Message, PublicProfile } from "../src/interfaces";
import { chatText } from "../src/text";
import { testIDS } from "../src/testIDs";
import { getChatTimestamp } from "../src/utils";

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
            timestamp: new Date(Date.UTC(2000, 0, 1, 8, 0)),
            userID: myUserID
        },
        {
            id: "id1",
            message: "hey",
            readStatus: true,
            recepientID: myUserID,
            timestamp: new Date(Date.UTC(2000, 0, 1, 8, 0)),
            userID: recepientProfile.id
        }
    ]
    const moreMessages : Message[] = [
        latestMessages[1],
        {
            id: "id2",
            message: "sooo",
            readStatus: false,
            recepientID: recepientProfile.id,
            timestamp: new Date(Date.UTC(2000, 0, 1, 6, 0)),
            userID: myUserID
        } 
    ]

    it("should send message", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        store.globalState.setTimezone("PST");

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
        expect(sentMessage?.recepientID).toEqual(recepientProfile.id);
    })

    it("should load older messages", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        store.globalState.setTimezone("PST");
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

    it("should report user", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        store.globalState.setTimezone("PST");

        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                    customNextChatLoad={moreMessages}
                />
            </StoreProvider>
        );

        const reportButton = screen.getByTestId(testIDS.reportUser);
        await act( () => {
            fireEvent(reportButton, "press")
        })

        const userReport = store.globalState.lastReport;
        expect(userReport?.reportedID).toEqual(recepientProfile.id);
    })

    it("should show timestamps", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        store.globalState.setTimezone("PST");
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                    customNextChatLoad={moreMessages}
                />
            </StoreProvider>
        );

        expect(screen.queryByText(getChatTimestamp(latestMessages[0].timestamp, "PST"))).not.toEqual(null);
        expect(screen.queryByText(getChatTimestamp(moreMessages[1].timestamp, "PST"))).toEqual(null);
        
        const scroll = screen.getByTestId(testIDS.chatScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop")
        })

        expect(screen.queryByText(getChatTimestamp(moreMessages[1].timestamp, "PST"))).not.toEqual(null);
        expect(screen.queryByText(getChatTimestamp(latestMessages[0].timestamp, "PST"))).not.toEqual(null);
    })

    it("should show read/delivered read status", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        store.globalState.setTimezone("PST");
        const StoreProvider = createStoreProvider(store);

        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                    customNextChatLoad={moreMessages}
                />
            </StoreProvider>
        );

        expect(screen.queryByText(chatText.delivered)).toEqual(null);
        expect(screen.getByTestId(`readStatus-${latestMessages[0].id}`)).not.toEqual(null);
        
        const scroll = screen.getByTestId(testIDS.chatScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop")
        })

        await act( () => {
            fireEvent(scroll,"scrollToTop");
        })

        expect(screen.queryByText(chatText.read)).toEqual(null);
        expect(screen.getByTestId(`readStatus-${moreMessages[1].id}`)).not.toEqual(null);
    })
})