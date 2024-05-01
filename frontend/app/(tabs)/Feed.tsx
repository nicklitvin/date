import { observer } from "mobx-react-lite";
import { PageHeader } from "../../src/components/PageHeader";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { feedText } from "../../src/text";
import { JustUserID, PublicProfile, SwipeFeed, SwipeStatus, WithKey } from "../../src/interfaces";
import { useEffect, useRef, useState } from "react";
import { ProfileViewEmbedMob } from "../../src/pages/ProfileViewEmbed";
import { URLs } from "../../src/urls";
import { sendRequest } from "../../src/utils";
import { Animated, RefreshControl, ScrollView } from "react-native";
import { globals } from "../../src/globals";
import { Link } from "expo-router";
import { useStore } from "../../src/store/RootStore";
import { testIDS } from "../../src/testIDs";
import Loading from "../Loading";

interface Props {
    dontAutoLoad?: boolean
}

export function Feed(props : Props) {
    const { globalState, receivedData } = useStore();
    
    const savedFeed = receivedData.swipeFeed;
    const savedSwipeStatus = globalState.swipeStatus;

    const opacity = useState(new Animated.Value(1))[0];
    const scrollViewRef = useRef<ScrollView>(null);

    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (props.dontAutoLoad) return
            if (!savedFeed) load();
        }
    }, [firstLoad])

    useEffect( () => {
        if (!firstLoad && !savedFeed && !props.dontAutoLoad) load();
    }, [savedFeed])

    useEffect( () => {
        if (savedFeed && savedSwipeStatus) {
            if (savedFeed && savedSwipeStatus.feedIndex == savedFeed.profiles.length && savedSwipeStatus.feedIndex > 0) {
                loadMoreFeed();
            }
            scrollToTop();
        }
    }, [savedSwipeStatus])

    const load = async () => {
        await getFeed();
    }

    const getFeed = async () => {
        try {
            const input : WithKey<JustUserID> = {
                key: receivedData.loginKey,
                userID: receivedData.profile?.id!
            }
            const response = await sendRequest(URLs.getFeed, input);
            globalState.resetSwipeStatus();
            receivedData.setSwipeFeed(response.data.data);
        } catch (err) {
            console.log(err);
        }
    }

    const scrollToTop = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    const loadMoreFeed = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            const response = await sendRequest(URLs.getFeed, input);
            globalState.resetSwipeStatus();
            receivedData.setSwipeFeed(response.data.data);
        } catch (err) {
            // console.log(err);
        }
    }

    const afterSwipe = () => {
        const feedI = savedSwipeStatus!.feedIndex;
        const lastSwipedI = savedSwipeStatus!.lastSwipedIndex

        globalState.setSwipeStatus({
            feedIndex: feedI,
            lastSwipedIndex: lastSwipedI + 1
        })

        if (globalState.disableFade) {
            globalState.setSwipeStatus({
                feedIndex: feedI + 1,
                lastSwipedIndex: lastSwipedI + 1
            })
            return;
        }

        Animated.timing(opacity, {
            toValue: 0,
            duration: globals.fadeDuration,
            useNativeDriver: true
        }).start(() => {
            globalState.setSwipeStatus({
                feedIndex: feedI + 1,
                lastSwipedIndex: lastSwipedI + 1
            })
            Animated.timing(opacity, {
                toValue: 1,
                duration: globals.fadeDuration,
                useNativeDriver: true
            }).start()
        })
    }

    const refresh = () => {
        const func = async () => {
            receivedData.setSwipeFeed(null);
            await loadMoreFeed();
            setRefreshing(false);
        }
        func();
    }

    if (!savedFeed && !props.dontAutoLoad) return <Loading />
    return (
        <StyledView className="w-full h-full bg-back">
        <StyledButton testID={testIDS.load} onPress={load}/>
        <StyledScroll 
            showsVerticalScrollIndicator={false} 
            ref={scrollViewRef}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refresh}    
                />
            }
        >
        <StyledView className="w-full h-full">

            <PageHeader
                title={feedText.pageTitle}
                imageType="Feed"
                rightContent={
                    <Link href="/Preferences">
                        <StyledImage
                            className="w-[35px] h-[35px]"
                            source={require("../../assets/Preferences.png")}
                        />
                    </Link>
                }
            />
            <Animated.View style={{ opacity: opacity}}
            >
                {
                    (!savedSwipeStatus || !savedFeed || savedSwipeStatus.feedIndex == savedFeed.profiles?.length) ? 
                    <StyledView className="flex items-center mt-[250px] flex-col">
                        <StyledImage
                            className="w-[100px] h-[100px]"
                            source={require("../../assets/Sad.png")}
                        />
                        <StyledText className="font-bold text-xl">
                            {feedText.noMoreFeed}
                        </StyledText>
                    </StyledView> :
                    <ProfileViewEmbedMob
                        isInSwipeFeed={true}
                        profile={savedFeed.profiles[savedSwipeStatus.feedIndex]}
                        afterSwipe={afterSwipe}
                        disableSwiping={savedSwipeStatus.lastSwipedIndex == savedSwipeStatus.feedIndex}
                        reportable={true}
                        likedMe={savedFeed.likedMeIDs.includes(savedFeed.profiles[savedSwipeStatus.feedIndex].id)}
                        loginKey={receivedData.loginKey}
                        userID={receivedData.profile?.id!}
                    />
                }
            </Animated.View>
        </StyledView>
        </StyledScroll>
        </StyledView>
    )
}

export const FeedMob = observer(Feed);
export default FeedMob;