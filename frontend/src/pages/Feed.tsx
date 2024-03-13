import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../styledElements";
import { feedText } from "../text";
import { PublicProfile } from "../interfaces";
import { useEffect, useRef, useState } from "react";
import { ProfileViewMob } from "./ProfileView";
import axios from "axios";
import { URLs } from "../urls";
import { createTimeoutSignal } from "../utils";
import { Animated, ScrollView } from "react-native";
import { globals } from "../globals";

interface Props {
    feed: PublicProfile[]
    returnFeedLength? (input : number) : number
    returnFeedIndex? (input : number) : number
    disableFade?: boolean
}

export function Feed(props : Props) {
    const [feed, setFeed] = useState<PublicProfile[]>(props.feed ?? []);
    const [feedIndex, setFeedIndex] = useState<number>(0);
    const [lastSwipedIndex, setLastSwipedIndex] = useState<number>(-1);
    const opacity = useState(new Animated.Value(1))[0];
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToTop = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    useEffect( () => {
        if (props.returnFeedLength) {
            props.returnFeedLength(feed.length);
        }
    }, [feed])

    useEffect( () => {
        if (props.returnFeedIndex) {
            props.returnFeedIndex(feedIndex);
        }
        if (feedIndex == feed.length) {
            loadMoreFeed();
        } 
        scrollToTop()
    }, [feedIndex])

    const loadMoreFeed = async () => {
        if (feed.length == 0) return 
        try {
            let moreFeed : PublicProfile[] = [];

            const response = await axios.post(URLs.server + URLs.getFeed, null, {
                signal: createTimeoutSignal()
            });
            moreFeed = response.data.data as PublicProfile[];
            setFeed(feed.concat(moreFeed));
        } catch (err) {
            console.log(err);
        }
    }

    const afterSwipe = () => {
        setLastSwipedIndex(lastSwipedIndex + 1);

        if (props.disableFade) {
            setFeedIndex(feedIndex + 1); 
            return;
        }

        Animated.timing(opacity, {
            toValue: 0,
            duration: globals.fadeDuration,
            useNativeDriver: true
        }).start(() => {
            setFeedIndex(feedIndex + 1);
            Animated.timing(opacity, {
                toValue: 1,
                duration: globals.fadeDuration,
                useNativeDriver: true
            }).start()
        })
    }

    return (
        <StyledScroll showsVerticalScrollIndicator={false} ref={scrollViewRef}>
        <StyledView>
            <PageHeader
                title={feedText.pageTitle}
                imageType="Feed"
                rightContent={
                    <StyledButton
                        onPress={ () => {}}
                    >
                        <StyledImage
                            className="w-[35px] h-[35px]"
                            source={require("../../assets/Preferences.png")}
                        />
                    </StyledButton>
                }
            />
            <Animated.View style={{ opacity: opacity}}
            >
                {
                    feedIndex == feed.length ? 
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
                        profile={feed[feedIndex]}
                        afterSwipe={afterSwipe}
                        disableSwiping={lastSwipedIndex == feedIndex}
                        ignoreRequest={true}
                        reportable={true}
                    />
                }
            </Animated.View>
        </StyledView>
        </StyledScroll>
    )
}

export const FeedMob = observer(Feed);