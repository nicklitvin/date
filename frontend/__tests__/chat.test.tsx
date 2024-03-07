import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { ChatMob } from "../src/pages/Chat";
import { GetChatInput, Message, MessageInput, PublicProfile, RequestReportInput } from "../src/interfaces";
import { chatText } from "../src/text";
import { testIDS } from "../src/testIDs";
import { getChatTimestamp } from "../src/utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { scrollToTopVal } from "../__testUtils__/easySetup";

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
    }
    const latestMessages : Message[] = [
        {
            id: "id",
            message: "hi",
            readStatus: true,
            recepientID: recepientProfile.id,
            timestamp: new Date(Date.UTC(2000, 0, 1, 8, 1)),
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
        const myMessage = "hi";
        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.sendMessage).reply(config => {
            const payload = JSON.parse(config.data) as MessageInput;
            expect(payload.message).toEqual(myMessage);
            expect(payload.recepientID).toEqual(recepientProfile.id);
            sent = true;

            return [200]
        })

        const store = new RootStore();
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob
                    publicProfile={recepientProfile}
                    latestMessages={[]}
                />
            </StoreProvider>
        );


        const myInput = screen.getByPlaceholderText(chatText.inputPlaceholder);
        await act( () => {
            fireEvent(myInput, "changeText", myMessage);
        })
        await act( () => {
            fireEvent(myInput, "submitEditing");
        })

        expect(sent).toEqual(true);
    })

    it("should load older messages", async () => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getChat).reply(config => {
            const payload = JSON.parse(config.data) as GetChatInput;

            expect(new Date(payload.fromTime).getTime()).toEqual(
                latestMessages[1].timestamp.getTime() - 1
            )
            expect(payload.withID).toEqual(recepientProfile.id);

            return [200, {
                data: moreMessages
            }];
        })

        const store = new RootStore();
        store.globalState.setTimezone("PST");
        const returnChatLength = jest.fn( (input) => input);
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                    returnChatLength={returnChatLength}
                />
            </StoreProvider>
        );

        expect(returnChatLength).toHaveLastReturnedWith(2);

        const scroll = screen.getByTestId(testIDS.chatScroll);
        await act( () => {
            fireEvent(scroll, "scroll", scrollToTopVal)
        })

        expect(returnChatLength).toHaveLastReturnedWith(3);
    })

    it("should report user", async () => {
        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.reportUser).reply(config => {
            const payload = JSON.parse(config.data) as RequestReportInput;
            expect(payload.reportedID).toEqual(recepientProfile.id);
            sent = true;
            return [200]
        })

        const store = new RootStore();
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                />
            </StoreProvider>
        );

        const reportButton = screen.getByTestId(testIDS.reportUser);
        await act( () => {
            fireEvent(reportButton, "press")
        })

        expect(sent).toEqual(true);
    })

    it("should show timestamps", async () => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getChat).reply(config => {
            return [200, {
                data: moreMessages
            }];
        })

        const timezone = "PST";
        const store = new RootStore();
        store.globalState.setTimezone(timezone);
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                />
            </StoreProvider>
        );

        expect(screen.queryByText(getChatTimestamp(
            latestMessages[1].timestamp, timezone)
        )).not.toEqual(null);
        expect(screen.queryByText(getChatTimestamp(
            moreMessages[0].timestamp, timezone)
        )).toEqual(null);
        
        const scroll = screen.getByTestId(testIDS.chatScroll);
        await act( () => {
            fireEvent(scroll, "scroll", scrollToTopVal)
        })

        expect(screen.queryByText(getChatTimestamp(
            moreMessages[0].timestamp, timezone)
        )).not.toEqual(null);
        expect(screen.queryByText(getChatTimestamp(
            latestMessages[1].timestamp, timezone)
        )).not.toEqual(null);
    })

    it("should show read/delivered read status", async () => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getChat).reply(config => {
            return [200, {
                data: moreMessages
            }];
        })

        const store = new RootStore();
        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                />
            </StoreProvider>
        );

        expect(screen.queryByText(chatText.read)).not.toEqual(null);
        expect(screen.queryByText(chatText.delivered)).toEqual(null);
        expect(screen.getByTestId(`readStatus-${latestMessages[0].id}`)).not.toEqual(null);
        
        const scroll = screen.getByTestId(testIDS.chatScroll);
        await act( () => {
            fireEvent(scroll, "scroll", scrollToTopVal)
        })

        expect(screen.queryByText(chatText.read)).not.toEqual(null);
        expect(screen.queryByText(chatText.delivered)).toEqual(null);
        expect(screen.getByTestId(`readStatus-${latestMessages[0].id}`)).not.toEqual(null);
    })
})