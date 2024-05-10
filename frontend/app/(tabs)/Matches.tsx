import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { matchesText } from "../../src/text";
import { ChatPreview, GetMatchesInput, NewMatchData, WithKey } from "../../src/interfaces";
import { ChatPreviewBox } from "../../src/components/ChatPreviewBox";
import { useEffect, useRef, useState } from "react";
import { testIDS } from "../../src/testIDs";
import { PageHeader } from "../../src/components/PageHeader";
import { URLs } from "../../src/urls";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { globals } from "../../src/globals";
import { differenceInSeconds } from "date-fns";
import { sendRequest } from "../../src/utils";
import { useStore } from "../../src/store/RootStore";
import { Link, router } from "expo-router";
import Loading from "../Loading";
import Toast from "react-native-toast-message";

interface Props {
    noAutoLoad?: boolean
}

export function Matches(props : Props) {
    const { receivedData } = useStore();
    const newMatches = receivedData.newMatches;
    const chatPreviews = receivedData.chatPreviews;

    const newMatchScrollRef = useRef<ScrollView>(null);
    const chatsScrollRef = useRef<ScrollView>(null);
    const [matchRequestTime, setMatchRequestTime] = useState<Date>(new Date(0));
    const [previewRequestTime, setPreviewRequestTime] = useState<Date>(new Date(0));
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (!props.noAutoLoad) load()
        }
    }, [firstLoad])

    const load = async () => {
        if (!receivedData.newMatches) await getNewMatches();
        if (!receivedData.chatPreviews) await getChatPreviews();
    }

    const getNewMatches = async (loadMoreFromTime? : Date) => {
        try {
            const newMatchDataInput : WithKey<GetMatchesInput> = {
                key: receivedData.loginKey,
                timestamp: loadMoreFromTime || new Date(),
                userID: receivedData.profile?.id!
            }
    
            const newMatchResponse = await sendRequest<NewMatchData[]>(URLs.getNewMatches, newMatchDataInput);
            if (newMatchResponse.message) {
                Toast.show({
                    type: "error",
                    text1: newMatchResponse.message,
                })
            } else if (newMatchResponse.data) {
                const processed = newMatchResponse.data.map( val => ({
                    profile: val.profile,
                    timestamp: new Date(val.timestamp)
                }))
                if (loadMoreFromTime && newMatches) {
                    receivedData.setNewMatches(newMatches.concat(processed))
                } else {
                    receivedData.setNewMatches(processed); 
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    const getChatPreviews = async (loadFromTime?: Date) => {
        try {
            const newMatchDataInput : WithKey<GetMatchesInput> = {
                key: receivedData.loginKey,
                timestamp: new Date(),
                userID: receivedData.profile?.id!
            }
            const chatPreviewResponse = await sendRequest<ChatPreview[]>(URLs.getNewChatPreviews, newMatchDataInput);
            if (chatPreviewResponse.message) {
                Toast.show({
                    type: "error",
                    text1: chatPreviewResponse.message,
                })
            } else if (chatPreviewResponse.data) {
                const processed : ChatPreview[] = chatPreviewResponse.data.map( val => ({
                    profile: val.profile,
                    message: {
                        ...val.message,
                        timestamp: new Date(val.message.timestamp)
                    }
                }))
                if (loadFromTime && chatPreviews) {
                    receivedData.setChatPreviews(chatPreviews.concat(processed))
                } else {
                    receivedData.setChatPreviews(processed);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleMatchScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const scrollWidth = contentSize.width - layoutMeasurement.width;
        const isAtRight = contentOffset.x >= scrollWidth * globals.scrollAtPercentage;
        const canSend = differenceInSeconds(new Date(), matchRequestTime) > globals.apiRequestTimeout;
        
        if (!(isAtRight && canSend)) return  
        setMatchRequestTime(new Date());

        const mostRecentTime = ( newMatches && newMatches.length > 0) ? 
            new Date(newMatches.at(-1)!.timestamp.getTime() - 1) :
            new Date()

        getNewMatches(mostRecentTime)
    }

    const handleChatsScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const scrollHeight = contentSize.height - layoutMeasurement.height;
        const isAtBottom = contentOffset.y >= scrollHeight * globals.scrollAtPercentage;
        const canSend = differenceInSeconds(new Date(), previewRequestTime) > globals.apiRequestTimeout;
        
        if (!(isAtBottom && canSend)) return
        setPreviewRequestTime(new Date())

        const mostRecentTime = ( chatPreviews && chatPreviews.length > 0) ? 
            new Date(chatPreviews.at(-1)!.message.timestamp.getTime() - 1) :
            new Date()
        getChatPreviews(mostRecentTime);
    }

    if (!newMatches || !chatPreviews) {
        return (
            <>
                <StyledButton testID={testIDS.load} onPress={load} />
                <Loading />
            </>
        )
    }

    return (
        <StyledView className="w-full h-full flex flex-col bg-back">
        <StyledScroll>
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
                            <Link 
                                key={`${match.profile.id}-${index}`}  
                                href={`Chat?userID=${match.profile.id}`}
                            >
                                <StyledView className="flex items-center pr-3">
                                    <StyledImage
                                        source={match.profile.images[0]?.url}
                                        className="w-[75px] h-[75px] rounded-full"
                                    />
                                </StyledView>
                            </Link>
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
                            key={`match-${match.profile.id}-${match.message.id}`} 
                            className="px-5 py-2"
                        >
                            <ChatPreviewBox
                                chatPreview={match}
                                onPress={() => router.push(`/Chat?userID=${match.profile.id}`)}
                            />
                        </StyledView>
                        
                    ))}
                </StyledView>
            </StyledScroll>                          
            }
        </StyledScroll>
        </StyledView>
    )
} 

export const MatchesMob = observer(Matches);
export default MatchesMob;

