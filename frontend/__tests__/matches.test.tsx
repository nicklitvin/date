import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { MatchesMob } from "../src/pages/Matches";
import { ChatPreview, Message, PublicProfile } from "../src/interfaces";
import { makePublicProfile, makeSentMessage } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";

describe("matches", () => {
    it("should get new matches and more on load", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const profile1 = makePublicProfile("id1");
        const profile2 = makePublicProfile("id2");
        const profile3 = makePublicProfile("id3");

        const newMatches : PublicProfile[] = [profile1, profile2];
        const loadMoreProfiles = [profile2, profile3]
        const getNewMatchLength = jest.fn( (input : number) => input);

        render(
            <StoreProvider value={store}>
                <MatchesMob
                    chatPreviews={[]}
                    newMatches={newMatches}
                    customNewMatches={loadMoreProfiles}
                    customNewMatchesLength={getNewMatchLength}
                />
            </StoreProvider>
        );

        expect(getNewMatchLength).toHaveLastReturnedWith(2);
        
        const scroll = screen.getByTestId(testIDS.newMatchScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop")
        })

        // TODO
        // const input = store.savedAPICalls.newMatchDataInput;
        // expect(input?.timestamp.getTime()).toEqual(new Date().getTime())

        expect(getNewMatchLength).toHaveLastReturnedWith(3);
    })

    it("should get new chat previews and more on load", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const profile1 = makePublicProfile("id1");
        const profile2 = makePublicProfile("id2");
        const profile3 = makePublicProfile("id3");

        const messages1 : Message[] = [makeSentMessage(profile1.id, new Date(3))];
        const messages2 : Message[] = [
            makeSentMessage(profile2.id, new Date(1)),
            makeSentMessage(profile2.id, new Date(2)),
        ];
        const messages3 : Message[] = [makeSentMessage(profile2.id, new Date(0))];

        const chatPreview1 : ChatPreview = {
            messages: messages1,
            profile: profile1
        }
        const chatPreview2 : ChatPreview = {
            messages: messages2,
            profile: profile2
        }
        const chatPreview3 : ChatPreview = {
            messages: messages3,
            profile: profile3
        }

        const getChatPreviewLength = jest.fn( (input : number) => input);

        render(
            <StoreProvider value={store}>
                <MatchesMob
                    newMatches={[]}
                    chatPreviews={[chatPreview2,chatPreview1]}
                    customNewChatPreviews={[chatPreview1, chatPreview3]}
                    customNewChatPreviewsLength={getChatPreviewLength}
                />
            </StoreProvider>
        );
        
        expect(getChatPreviewLength).toHaveLastReturnedWith(2);

        const scroll = screen.getByTestId(testIDS.chatPreviewScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop");
        });

        const input = store.savedAPICalls.newMatchDataInput;
        expect(input?.timestamp.getTime()).toEqual(messages2[1].timestamp.getTime());

        expect(getChatPreviewLength).toHaveLastReturnedWith(3);
    })
})