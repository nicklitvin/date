import { observer } from "mobx-react-lite";
import { PageHeader } from "../../src/components/PageHeader";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { feedText } from "../../src/text";
import { PublicProfile, SwipeFeed, SwipeStatus } from "../../src/interfaces";
import { useEffect, useRef, useState } from "react";
import { ProfileViewMob } from "../../src/pages/ProfileView";
import { URLs } from "../../src/urls";
import { sendRequest } from "../../src/utils";
import { Animated, ScrollView } from "react-native";
import { globals } from "../../src/globals";
import { Link } from "expo-router";
import { useStore } from "../../src/store/RootStore";
import { testIDS } from "../../src/testIDs";

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

    useEffect( () => {
        if (props.dontAutoLoad) return
        load();
    })

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

            if (feed && swipeStatus.feedIndex == feed.profiles.length) {
                loadMoreFeed();
            }
            scrollToTop();
        }
    }, [swipeStatus])

    const load = async () => {
        try {
            if (!feed) {
                const response = await sendRequest(URLs.getFeed, null);
                setFeed(response.data.data);
                setSwipeStatus({
                    feedIndex: 0,
                    lastSwipedIndex: -1
                })
            }
        } catch (err) {}
    }

    const scrollToTop = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    const loadMoreFeed = async () => {
        if (!feed || feed.profiles.length == 0) return 
        try {
            let moreFeed : SwipeFeed;
            const response = await sendRequest(URLs.getFeed, null);
            moreFeed = response.data.data as SwipeFeed;
            setFeed({
                profiles: feed.profiles.concat(moreFeed.profiles),
                likedMeIDs: feed.likedMeIDs.concat(moreFeed.likedMeIDs)
            })
        } catch (err) {
            // console.log(err);
        }
    }

    const afterSwipe = () => {
        setSwipeStatus({
            feedIndex: swipeStatus!.feedIndex,
            lastSwipedIndex: swipeStatus!.lastSwipedIndex + 1
        })

        if (globalState.disableFade) {
            setSwipeStatus({
                feedIndex: swipeStatus!.feedIndex + 1,
                lastSwipedIndex: swipeStatus!.lastSwipedIndex
            })
            return;
        }

        Animated.timing(opacity, {
            toValue: 0,
            duration: globals.fadeDuration,
            useNativeDriver: true
        }).start(() => {
            setSwipeStatus({
                feedIndex: swipeStatus!.feedIndex + 1,
                lastSwipedIndex: swipeStatus!.lastSwipedIndex
            })
            Animated.timing(opacity, {
                toValue: 1,
                duration: globals.fadeDuration,
                useNativeDriver: true
            }).start()
        })
    }

    return (
        <StyledView className="w-full h-full bg-back">
        <StyledButton testID={testIDS.load} onPress={load}/>
        <StyledScroll showsVerticalScrollIndicator={false} ref={scrollViewRef}>
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
                    <ProfileViewMob
                        isInSwipeFeed={true}
                        profile={feed.profiles[swipeStatus.feedIndex]}
                        afterSwipe={afterSwipe}
                        disableSwiping={swipeStatus.lastSwipedIndex == swipeStatus.feedIndex}
                        ignoreRequest={true}
                        reportable={true}
                        likedMe={feed.likedMeIDs.includes(feed.profiles[swipeStatus.feedIndex].id)}
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