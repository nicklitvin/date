import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { RootStore, createStoreProvider } from "../src/store/RootStore";
import { MatchesMob } from "../src/pages/Matches";
import { ChatPreview, Message, PublicProfile } from "../src/interfaces";
import { makePublicProfile, makeReceivedMessage, makeSentMessage } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";

describe("matches", () => {
    it("should get new matches and more on load", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const profile1 = makePublicProfile("id1");
        const profile2 = makePublicProfile("id2");

        const newMatches : PublicProfile[] = [profile1];
        const loadMoreProfiles = [profile1, profile2]
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

        expect(getNewMatchLength).toHaveLastReturnedWith(1);
        
        const scroll = screen.getByTestId(testIDS.newMatchScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop")
        })

        expect(getNewMatchLength).toHaveLastReturnedWith(2);
    })

    it("should get new chat previews and more on load", async () => {
        const store = new RootStore();
        store.globalState.setUseHttp(false);
        const StoreProvider = createStoreProvider(store);

        const profile1 = makePublicProfile("id1");
        const profile2 = makePublicProfile("id2");
        const messages1 : Message[] = [makeSentMessage(profile1.id)];
        const messages2 : Message[] = [makeSentMessage(profile2.id)];
        const chatPreview1 : ChatPreview = {
            messages: messages1,
            profile: profile1
        }
        const chatPreview2 : ChatPreview = {
            messages: messages2,
            profile: profile2
        }
        const getChatPreviewLength = jest.fn( (input : number) => input);

        render(
            <StoreProvider value={store}>
                <MatchesMob
                    newMatches={[]}
                    chatPreviews={[chatPreview1]}
                    customNewChatPreviews={[chatPreview1, chatPreview2]}
                    customNewChatPreviewsLength={getChatPreviewLength}
                />
            </StoreProvider>
        );
        
        expect(getChatPreviewLength).toHaveLastReturnedWith(1);

        const scroll = screen.getByTestId(testIDS.chatPreviewScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop");
        });

        expect(getChatPreviewLength).toHaveLastReturnedWith(2);
    })
})