import { observer } from "mobx-react-lite";
import { StyledScroll, StyledText, StyledView } from "../styledElements";
import { matchesText } from "../text";
import { ChatPreview, PublicProfile } from "../interfaces";
import { Image } from "expo-image";
import { ChatPreviewBox } from "../components/ChatPreviewBox";
import { useEffect, useState } from "react";
import { useStore } from "../store/RootStore";
import axios from "axios";
import { globals } from "../globals";
import { testIDS } from "../testIDs";

interface Props {
    newMatches: PublicProfile[]
    chatPreviews: ChatPreview[]
    customNewMatches?: PublicProfile[]
    customNewChatPreviews?: ChatPreview[]
    customNewMatchesLength?: (input : number) => number
    customNewChatPreviewsLength?: (input : number) => number
}

export function Matches(props : Props) {
    const [newMatches, setNewMatches] = useState<PublicProfile[]>(props.newMatches ?? []);
    const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>(props.chatPreviews ?? []);
    const {globalState} = useStore();

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
            let newMatches : PublicProfile[] = [];
            if (globalState.useHttp) {
                const response = await axios.post(globals.URLServer + globals.URLGetNewMatches); 
                newMatches = response.data;
            } else {
                newMatches = props.customNewMatches!;
            }   
            const uniqueNewMatches = new Set<PublicProfile>(newMatches.concat(newMatches));
            setNewMatches(Array.from(uniqueNewMatches));
        } catch (err) {
            console.log(err);
        }
    }

    const loadMoreChatPreviews = async () => {
        try {
            let newChatPreviews : ChatPreview[] = [];
            if (globalState.useHttp) {
                const response = await axios.post(globals.URLServer + globals.URLGetNewChatPreviews);
                newChatPreviews = response.data;
            } else {
                newChatPreviews = props.customNewChatPreviews!;
            }
            const uniqueChatPreviews = new Set<ChatPreview>(newChatPreviews.concat(chatPreviews));
            const orderedPreviews = Array.from(uniqueChatPreviews).sort( (a,b) => 
                b.messages.at(-1)!.timestamp.getTime() - a.messages.at(-1)!.timestamp.getTime()
            )
            setChatPreviews(orderedPreviews);
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <StyledView>
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
                        key={`${match.id}-${index}`}
                        source={match.images[0]}
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

