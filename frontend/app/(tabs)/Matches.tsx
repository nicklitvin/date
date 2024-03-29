import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { matchesText } from "../../src/text";
import { ChatPreview, NewMatch, NewMatchDataInput } from "../../src/interfaces";
import { ChatPreviewBox } from "../../src/components/ChatPreviewBox";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { testIDS } from "../../src/testIDs";
import { PageHeader } from "../../src/components/PageHeader";
import { URLs } from "../../src/urls";
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl, ScrollView } from "react-native";
import { globals } from "../../src/globals";
import { differenceInSeconds } from "date-fns";
import { createTimeoutSignal, sendRequest } from "../../src/utils";
import { useStore } from "../../src/store/RootStore";
import { Link, router } from "expo-router";

interface Props {
    noAutoLoad?: boolean
    getNewMatchLength?: (input : number) => void
    getChatPreviewLength?: (input : number) => void
}

export function Matches(props : Props) {
    const { receivedData } = useStore();

    const [newMatches, setNewMatches] = useState<NewMatch[]>(receivedData.newMatches ?? []);
    const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>(receivedData.chatPreviews ?? []);

    const newMatchScrollRef = useRef<ScrollView>(null);
    const chatsScrollRef = useRef<ScrollView>(null);
    const [matchRequestTime, setMatchRequestTime] = useState<Date>(new Date(0));
    const [previewRequestTime, setPreviewRequestTime] = useState<Date>(new Date(0));
    
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect( () => {
        if (firstLoad) {
            if (props.noAutoLoad) return
            load()
        }
        setFirstLoad(false);
    })

    const load = async () => {
        if (!receivedData.newMatches) {
            await getNewMatches()
        }
        if (!receivedData.chatPreviews) {
            await getChatPreviews();
        }
    }

    useEffect( () => {
        if (props.getChatPreviewLength) props.getChatPreviewLength(chatPreviews.length)

        const savedPreviews = receivedData.chatPreviews;
        if (
            !savedPreviews && chatPreviews.length > 0 || 
            (savedPreviews && chatPreviews.length > savedPreviews.length)
        ) {
            receivedData.setChatPreviews(chatPreviews)
        }
    }, [chatPreviews])

    useEffect( () => {
        if (props.getNewMatchLength) props.getNewMatchLength(newMatches.length)

        const savedMatches = receivedData.newMatches;
        if (
            !savedMatches && newMatches.length > 0 ||
            (savedMatches && newMatches.length > savedMatches.length)
        ) {
            receivedData.setNewMatches(newMatches);
        }
    }, [newMatches])

    const getNewMatches = async () => {
        try {
            const newMatchDataInput : NewMatchDataInput = {
                timestamp: new Date()
            }
    
            const newMatchResponse = await sendRequest(URLs.getNewMatches, newMatchDataInput);
            const data = newMatchResponse.data.data as NewMatch[];
            const processed : NewMatch[] = data.map( val => ({
                profile: val.profile,
                timestamp: new Date(val.timestamp)
            })) 
            setNewMatches(processed);
        } catch (err) {
            console.log(err);
        }
    }

    const getChatPreviews = async () => {
        try {
            const newMatchDataInput : NewMatchDataInput = {
                timestamp: new Date()
            }
            const chatPreviewResponse = await sendRequest(URLs.getNewChatPreviews, newMatchDataInput);
            const data = chatPreviewResponse.data.data as ChatPreview[];
            const processed : ChatPreview[] = data.map( val => ({
                profile: val.profile,
                message: {
                    ...val.message,
                    timestamp: new Date(val.message.timestamp)
                }
            }))
            setChatPreviews(processed);
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
                timestamp: new Date(chatPreviews.at(-1)!.message.timestamp.getTime() - 1)
            }

            const response = await axios.post(URLs.server + URLs.getNewChatPreviews, input, {
                signal: createTimeoutSignal()
            });
            newChatPreviews = response.data.data as ChatPreview[];
            newChatPreviews = newChatPreviews.map( val => ({
                profile: val.profile,
                message: {
                    ...val.message,
                    timestamp: new Date(val.message.timestamp)
                }
            }))
            setChatPreviews(chatPreviews.concat(newChatPreviews));
        } catch (err) {
            console.log(err)
        }
    }

    const refresh = () => {
        receivedData.setNewMatches(null);
        receivedData.setChatPreviews(null);
        setNewMatches([]);
        setChatPreviews([]);
        getChatPreviews();
        getNewMatches();
        setRefreshing(false);
    }

    return (
        <StyledView className="w-full h-full flex flex-col bg-back">
        <StyledScroll
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refresh}    
                />
            }
        >
            <StyledButton testID={testIDS.load} onPress={load} />
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
                                        source={match.profile.images[0]}
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
                            key={`match-${match.profile.id}`} 
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

