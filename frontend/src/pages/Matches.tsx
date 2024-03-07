import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../styledElements";
import { matchesText } from "../text";
import { ChatPreview, NewMatch, NewMatchDataInput } from "../interfaces";
import { Image } from "expo-image";
import { ChatPreviewBox } from "../components/ChatPreviewBox";
import { useEffect, useState } from "react";
import axios from "axios";
import { testIDS } from "../testIDs";
import { PageHeader } from "../components/PageHeader";
import { URLs } from "../urls";

interface Props {
    newMatches: NewMatch[]
    chatPreviews: ChatPreview[]
    returnNewMatchesLength?: (input : number) => number
    returnNewChatPreviewsLength?: (input : number) => number
}

export function Matches(props : Props) {
    const [newMatches, setNewMatches] = useState<NewMatch[]>(props.newMatches ?? []);
    const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>(props.chatPreviews ?? []);

    useEffect( () => {
        if (props.returnNewChatPreviewsLength) {
            props.returnNewChatPreviewsLength(chatPreviews.length)
        }
    }, [chatPreviews])

    useEffect( () => {
        if (props.returnNewMatchesLength) {
            props.returnNewMatchesLength(newMatches.length);
        }
    }, [newMatches])

    const loadMoreNewMatches = async () => {
        try {
            let receivedNewMatches : NewMatch[] = [];
            const input : NewMatchDataInput = {
                timestamp: new Date(newMatches.at(-1)!.timestamp.getTime() - 1)
            }

            const response = await axios.post(URLs.server + URLs.getNewMatches, input); 
            receivedNewMatches = response.data.data;
            receivedNewMatches = receivedNewMatches.map( val => ({
                ...val,
                timestamp: new Date(val.timestamp)
            }))

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

            const response = await axios.post(URLs.server + URLs.getNewChatPreviews, input);
            newChatPreviews = response.data.data as ChatPreview[];
            newChatPreviews = newChatPreviews.map( val => ({
                ...val,
                messages: val.messages.map( message => ({
                    ...message,
                    timestamp: new Date(message.timestamp)
                }))
            }))
            setChatPreviews(chatPreviews.concat(newChatPreviews));
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <StyledView className="w-full h-full flex flex-col">
            <PageHeader
                title={matchesText.pageTitle}
                imageType="Matches"
            />
            <StyledText className="font-bold text-xl px-5">
                {`${matchesText.newMatches}`}
            </StyledText>
            <StyledView className="py-3 px-5">
                <StyledScroll
                    horizontal={true}
                    // onScrollToTop={loadMoreNewMatches}
                    testID={testIDS.newMatchScroll}
                >
                    {newMatches.map( (match, index) => (
                        <StyledButton
                            key={`${match.profile.id}-${index}`}    
                            className="flex items-center pr-3"
                        >
                            <StyledImage
                                source={match.profile.images[0]}
                                className="w-[75px] h-[75px] rounded-full"
                            />
                            <StyledText className="text-base">
                                {match.profile.name}
                            </StyledText>
                        </StyledButton>
                    ))}
                </StyledScroll>
            </StyledView>
            
            <StyledText className="font-bold text-xl px-5">
                {`${matchesText.chats}`}
            </StyledText>
            <StyledScroll
                testID={testIDS.chatPreviewScroll}
                showsVerticalScrollIndicator={true}
            >
                <StyledView className="pb-2">
                    {chatPreviews.map( (match,index) => (
                        <StyledView 
                            key={`match-${match.profile.id}`} 
                            className="px-5 py-2"
                        >
                            <ChatPreviewBox
                                chatPreview={match}
                            />
                        </StyledView>
                        
                    ))}
                </StyledView>
            </StyledScroll>                          
        </StyledView>
    )
} 

export const MatchesMob = observer(Matches);

