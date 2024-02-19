import { observer } from "mobx-react-lite";
import { StyledScroll, StyledText, StyledView } from "../styledElements";
import { matchesText } from "../text";
import { ChatPreview, NewMatch, NewMatchDataInput, PublicProfile } from "../interfaces";
import { Image } from "expo-image";
import { ChatPreviewBox } from "../components/ChatPreviewBox";
import { useEffect, useState } from "react";
import { useStore } from "../store/RootStore";
import axios from "axios";
import { testIDS } from "../testIDs";
import { PageHeader } from "../components/PageHeader";
import { URLs } from "../urls";

interface Props {
    newMatches: NewMatch[]
    chatPreviews: ChatPreview[]
    customNewMatches?: NewMatch[]
    customNewChatPreviews?: ChatPreview[]
    customNewMatchesLength?: (input : number) => number
    customNewChatPreviewsLength?: (input : number) => number
}

export function Matches(props : Props) {
    const [newMatches, setNewMatches] = useState<NewMatch[]>(props.newMatches ?? []);
    const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>(props.chatPreviews ?? []);
    const {globalState,savedAPICalls} = useStore();

    useEffect( () => {
        if (props.customNewChatPreviewsLength) {
            props.customNewChatPreviewsLength(chatPreviews.length)
        }
    }, [chatPreviews])

    useEffect( () => {
        if (props.customNewMatchesLength) {
            props.customNewMatchesLength(newMatches.length);
        }
    }, [newMatches])

    const loadMoreNewMatches = async () => {
        try {
            let receivedNewMatches : NewMatch[] = [];
            const input : NewMatchDataInput = {
                timestamp: new Date(newMatches.at(-1)!.timestamp.getTime() - 1)
            }

            if (globalState.useHttp) {
                const response = await axios.post(URLs.server + URLs.getNewMatches, input); 
                receivedNewMatches = response.data;
            } else {
                savedAPICalls.setNewMatchDataInput(input);
                receivedNewMatches = props.customNewMatches!;
            }   

            setNewMatches(newMatches.concat(receivedNewMatches));
        } catch (err) {
            console.log(err);
        }
    }

    const loadMoreChatPreviews = async () => {
        try {
            let newChatPreviews : ChatPreview[] = [];
            const input : NewMatchDataInput = {
                timestamp: new Date(chatPreviews.at(-1)!.messages[0].timestamp.getTime() - 1)
            }

            if (globalState.useHttp) {
                const response = await axios.post(URLs.server + URLs.getNewChatPreviews, input);
                newChatPreviews = response.data;
            } else {
                savedAPICalls.setNewMatchDataInput(input);
                newChatPreviews = props.customNewChatPreviews!;
            }
            setChatPreviews(chatPreviews.concat(newChatPreviews));
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <StyledView>
            <PageHeader
                title={matchesText.pageTitle}
                imageSource={""}
            />
            <StyledText>
                {`${matchesText.newMatches}`}
            </StyledText>
            <StyledScroll
                horizontal={true}
                onScrollToTop={loadMoreNewMatches}
                testID={testIDS.newMatchScroll}
            >
                {newMatches.map( (match, index) => (
                    <Image
                        key={`${match.profile.id}-${index}`}
                        source={match.profile.images[0]}
                    />
                ))}
            </StyledScroll>
            <StyledText>
                {`${matchesText.chats}`}
            </StyledText>
            <StyledScroll
                onScrollToTop={loadMoreChatPreviews}
                testID={testIDS.chatPreviewScroll}
            >
                {chatPreviews.map( (match,index) => (
                    <ChatPreviewBox
                        key={`match-${match.profile.id}`}
                        chatPreview={match}
                    />
                ))}
            </StyledScroll>
        </StyledView>
    )
} 

export const MatchesMob = observer(Matches);

