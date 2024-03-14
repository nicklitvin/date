import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { matchesText } from "../../src/text";
import { ChatPreview, NewMatch, NewMatchDataInput } from "../../src/interfaces";
import { Image } from "expo-image";
import { ChatPreviewBox } from "../../src/components/ChatPreviewBox";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { testIDS } from "../../src/testIDs";
import { PageHeader } from "../../src/components/PageHeader";
import { URLs } from "../../src/urls";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { globals } from "../../src/globals";
import { differenceInSeconds } from "date-fns";
import { createTimeoutSignal } from "../../src/utils";

interface Props {
    newMatches: NewMatch[]
    chatPreviews: ChatPreview[]
    returnNewMatchesLength?: (input : number) => number
    returnNewChatPreviewsLength?: (input : number) => number
}

export function Matches(props : Props) {
    const [newMatches, setNewMatches] = useState<NewMatch[]>(props.newMatches ?? []);
    const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>(props.chatPreviews ?? []);
    const newMatchScrollRef = useRef<ScrollView>(null);
    const chatsScrollRef = useRef<ScrollView>(null);
    const [matchRequestTime, setMatchRequestTime] = useState<Date>(new Date(0));
    const [previewRequestTime, setPreviewRequestTime] = useState<Date>(new Date(0));

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

    const handleMatchScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const scrollWidth = contentSize.width - layoutMeasurement.width;
        const isAtRight = contentOffset.x >= scrollWidth * globals.scrollAtPercentage;
        const canSend = differenceInSeconds(new Date(), matchRequestTime) > globals.apiRequestTimeout;
        
        if (!(isAtRight && canSend)) return  
        setMatchRequestTime(new Date());

        try {
            let receivedNewMatches : NewMatch[] = [];
            const input : NewMatchDataInput = {
                timestamp: new Date(newMatches.at(-1)!.timestamp.getTime() - 1)
            }
            const response = await axios.post(URLs.server + URLs.getNewMatches, input, {
                signal: createTimeoutSignal()
            }); 
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

    const handleChatsScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const scrollHeight = contentSize.height - layoutMeasurement.height;
        const isAtBottom = contentOffset.y >= scrollHeight * globals.scrollAtPercentage;
        const canSend = differenceInSeconds(new Date(), previewRequestTime) > globals.apiRequestTimeout;
        if (!(isAtBottom && canSend)) return
        setPreviewRequestTime(new Date())

        try {
            let newChatPreviews : ChatPreview[] = [];
            const input : NewMatchDataInput = {
                timestamp: new Date(chatPreviews.at(-1)!.messages[0].timestamp.getTime() - 1)
            }

            const response = await axios.post(URLs.server + URLs.getNewChatPreviews, input, {
                signal: createTimeoutSignal()
            });
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
        <StyledView className="w-full h-full flex flex-col bg-back">
            <PageHeader
                title={matchesText.pageTitle}
                imageType="Matches"
            />
            <StyledText className="font-bold text-xl px-5">
                {`${matchesText.newMatches}`}
            </StyledText>
            <StyledView className="py-3 px-5">
                {
                    newMatches.length == 0 ?
                    <StyledView className="flex flex-row justify-center items-center">
                        <StyledImage
                            source={require("../../assets/brokenHeart.png")}
                            className="w-[50px] h-[50px]"
                        />
                        <StyledText className="font-bold text-base">
                            {matchesText.noNewMatches}  
                        </StyledText>
                    </StyledView> :
                    <StyledScroll
                        ref={newMatchScrollRef}
                        horizontal={true}
                        onScroll={handleMatchScroll}
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
                            </StyledButton>
                        ))}
                    </StyledScroll>
                }
            </StyledView>
            
            <StyledText className="font-bold text-xl px-5">
                {`${matchesText.chats}`}
            </StyledText>
            {
            chatPreviews.length == 0 ?
            <StyledView className="flex flex-row justify-center items-center">
                <StyledImage
                    source={require("../../assets/brokenHeart.png")}
                    className="w-[50px] h-[50px]"
                />
                <StyledText className="font-bold text-base">
                    {matchesText.noChats}  
                </StyledText>
            </StyledView> :
            <StyledScroll
                testID={testIDS.chatPreviewScroll}
                showsVerticalScrollIndicator={true}
                onScroll={handleChatsScroll}
                ref={chatsScrollRef}
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
            }
            
        </StyledView>
    )
} 

const MatchesMob = observer(Matches);
export default MatchesMob;

