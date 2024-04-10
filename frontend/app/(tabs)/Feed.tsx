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
    getFeedIndex?: (input : number) => void
    getFeedLength?: (input : number) => void
}

export function Feed(props : Props) {
    const { globalState, receivedData } = useStore();

    const [feed, setFeed] = useState<SwipeFeed|null>(receivedData.swipeFeed);
    const [swipeStatus, setSwipeStatus] = useState<SwipeStatus|null>(receivedData.swipeStatus);
    const opacity = useState(new Animated.Value(1))[0];
    const scrollViewRef = useRef<ScrollView>(null);

    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (props.dontAutoLoad) return
            load();
        }
    }, [firstLoad])

    useEffect( () => {
        if (feed) {
            if (props.getFeedLength) props.getFeedLength(feed.profiles.length)
            receivedData.setSwipeFeed(feed)
        }
    }, [feed])

    useEffect( () => {
        if (swipeStatus) {
            if (props.getFeedIndex) props.getFeedIndex(swipeStatus.feedIndex);

            receivedData.setSwipeStatus(swipeStatus);

            if (feed && swipeStatus.feedIndex == feed.profiles.length && swipeStatus.feedIndex > 0) {
                loadMoreFeed();
            }
            scrollToTop();
        }
    }, [swipeStatus])

    const load = async () => {
        if (!receivedData.swipeFeed) {
            await getFeed();
        }
    }

    const getFeed = async () => {
        try {
            const input : WithKey<JustUserID> = {
                key: receivedData.loginKey,
                userID: receivedData.profile?.id!
            }
            const response = await sendRequest(URLs.getFeed, input);
            setSwipeStatus({
                feedIndex: 0,
                lastSwipedIndex: -1
            })
            setFeed(response.data.data);
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
            setSwipeStatus({
                feedIndex: 0,
                lastSwipedIndex: -1
            });
            setFeed(response.data.data);
        } catch (err) {
            // console.log(err);
        }
    }

    const afterSwipe = () => {
        const feedI = swipeStatus!.feedIndex;
        const lastSwipedI = swipeStatus!.lastSwipedIndex

        setSwipeStatus({
            feedIndex: feedI,
            lastSwipedIndex: lastSwipedI + 1
        })

        if (globalState.disableFade) {
            setSwipeStatus({
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
            setSwipeStatus({
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
            setFeed(null);
            await loadMoreFeed();
            setRefreshing(false);
        }
        func();
    }

    if (!feed && !props.dontAutoLoad) return <Loading />
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
                    (!swipeStatus || !feed || swipeStatus.feedIndex == feed.profiles.length) ? 
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
                        profile={feed.profiles[swipeStatus.feedIndex]}
                        afterSwipe={afterSwipe}
                        disableSwiping={swipeStatus.lastSwipedIndex == swipeStatus.feedIndex}
                        reportable={true}
                        likedMe={feed.likedMeIDs.includes(feed.profiles[swipeStatus.feedIndex].id)}
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