import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { MatchesMob } from "../src/pages/Matches";
import { ChatPreview, Message, NewMatch, NewMatchDataInput, PublicProfile } from "../src/interfaces";
import { makePublicProfile, makeSentMessage } from "../__testUtils__/easySetup";
import { testIDS } from "../src/testIDs";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";

describe("matches", () => {
    const profiles = [
        makePublicProfile("id1"),
        makePublicProfile("id2"),
        makePublicProfile("id3")
    ];

    it("should get new matches and more on load", async () => {
        const newMatches : NewMatch[] = [
            {profile: profiles[0], timestamp : new Date(5)},
            {profile: profiles[1], timestamp : new Date(4)},
        ];

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getNewMatches).reply( config => {
            const payload = JSON.parse(config.data) as NewMatchDataInput;
            expect(new Date(payload.timestamp).getTime()).toEqual(
                new Date(newMatches[1].timestamp.getTime() - 1).getTime()
            );
            return [200, {data: [
                {profile: profiles[2], timestamp : new Date(3)},
            ]}]
        })
        
        const getNewMatchLength = jest.fn( (input : number) => input);
        render(
            <MatchesMob
                chatPreviews={[]}
                newMatches={newMatches}
                returnNewMatchesLength={getNewMatchLength}
            />
        );

        expect(getNewMatchLength).toHaveLastReturnedWith(2);
        
        const scroll = screen.getByTestId(testIDS.newMatchScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop")
        })

        expect(getNewMatchLength).toHaveLastReturnedWith(3);
    })

    it("should get new chat previews and more on load", async () => {
        const messages1 : Message[] = [makeSentMessage(profiles[0].id, new Date(4))];
        const messages2 : Message[] = [
            makeSentMessage(profiles[1].id, new Date(3)),
            makeSentMessage(profiles[1].id, new Date(2)),
        ];
        const messages3 : Message[] = [makeSentMessage(profiles[2].id, new Date(1))];

        const chatPreview1 : ChatPreview = {
            messages: messages1,
            profile: profiles[0]
        }
        const chatPreview2 : ChatPreview = {
            messages: messages2,
            profile: profiles[1]
        }
        const chatPreview3 : ChatPreview = {
            messages: messages3,
            profile: profiles[2]
        }

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.getNewChatPreviews).reply( config => {
            const payload = JSON.parse(config.data) as NewMatchDataInput;
            expect(new Date(payload.timestamp).getTime()).toEqual(
                messages2[0].timestamp.getTime() - 1
            )

            return [200, {data: [chatPreview3]}]    
        })

        const getChatPreviewLength = jest.fn( (input : number) => input);
        render(
            <MatchesMob
                newMatches={[]}
                chatPreviews={[chatPreview1,chatPreview2]}
                returnNewChatPreviewsLength={getChatPreviewLength}
            />
        );
        
        expect(getChatPreviewLength).toHaveLastReturnedWith(2);

        const scroll = screen.getByTestId(testIDS.chatPreviewScroll);
        await act( () => {
            fireEvent(scroll, "scrollToTop");
        });

        expect(getChatPreviewLength).toHaveLastReturnedWith(3);
    })
})