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
        const store = new RootStore();
        const mock = new MockAdapter(axios);
        const myMessage = "hi";

        mock.onPost(URLs.server + URLs.sendMessage).reply(config => {
            const payload = JSON.parse(config.data) as MessageInput;

            expect(payload.message).toEqual(myMessage);
            expect(payload.recepientID).toEqual(recepientProfile.id);

            return [200]
        })

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
    })

    it("should load older messages", async () => {
        const store = new RootStore();
        store.globalState.setTimezone("PST");
        const returnChatLength = jest.fn( (input) => input);

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getChat).reply(config => {
            const payload = JSON.parse(config.data) as GetChatInput;

            expect(new Date(payload.fromTime).getTime()).toBeLessThan(
                latestMessages[1].timestamp.getTime()
            )
            expect(payload.withID).toEqual(recepientProfile.id);

            return [200, {
                data: moreMessages
            }];
        })

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
            fireEvent(scroll, "scrollToTop")
        })

        expect(returnChatLength).toHaveLastReturnedWith(3);
    })

    it("should report user", async () => {
        const store = new RootStore();

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.reportUser).reply(config => {
            const payload = JSON.parse(config.data) as RequestReportInput;
            expect(payload.reportedID).toEqual(recepientProfile.id);
            return [200]
        })

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
    })

    it("should show timestamps", async () => {
        const timezone = "PST";
        const store = new RootStore();
        store.globalState.setTimezone(timezone);

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getChat).reply(config => {
            return [200, {
                data: moreMessages
            }];
        })

        const StoreProvider = createStoreProvider(store);
        render(
            <StoreProvider value={store}>
                <ChatMob
                    latestMessages={latestMessages}
                    publicProfile={recepientProfile}
                    // customNextChatLoad={moreMessages}
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
            fireEvent(scroll, "scrollToTop")
        })

        expect(screen.queryByText(getChatTimestamp(
            moreMessages[0].timestamp, timezone)
        )).not.toEqual(null);
        expect(screen.queryByText(getChatTimestamp(
            latestMessages[1].timestamp, timezone)
        )).not.toEqual(null);
    })

    it("should show read/delivered read status", async () => {
        const store = new RootStore();
        const StoreProvider = createStoreProvider(store);

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getChat).reply(config => {
            return [200, {
                data: moreMessages
            }];
        })

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
            fireEvent(scroll, "scrollToTop")
        })

        expect(screen.queryByText(chatText.read)).not.toEqual(null);
        expect(screen.queryByText(chatText.delivered)).toEqual(null);
        expect(screen.getByTestId(`readStatus-${latestMessages[0].id}`)).not.toEqual(null);
    })
})