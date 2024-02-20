import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { StyledText, StyledView } from "../styledElements";
import { feedText } from "../text";
import { PublicProfile } from "../interfaces";
import { useEffect, useState } from "react";
import { ProfileViewMob } from "./ProfileView";
import axios from "axios";
import { URLs } from "../urls";

interface Props {
    feed: PublicProfile[]
    returnFeedLength? (input : number) : number
    returnFeedIndex? (input : number) : number
}

export function Feed(props : Props) {
    const [feed, setFeed] = useState<PublicProfile[]>(props.feed ?? []);
    const [feedIndex, setFeedIndex] = useState<number>(0);

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
    }, [feedIndex])

    const loadMoreFeed = async () => {
        if (feed.length == 0) return 
        try {
            let moreFeed : PublicProfile[] = [];

            const response = await axios.post(URLs.server + URLs.getFeed);
            moreFeed = response.data.data as PublicProfile[];
            setFeed(feed.concat(moreFeed));
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledView>
            <PageHeader
                title={feedText.pageTitle}
                imageSource=""
            />
            {
                feedIndex == feed.length ? 
                <StyledView>
                    <StyledText>
                        {feedText.noMoreFeed}
                    </StyledText>
                </StyledView> :
                <ProfileViewMob
                    isInSwipeFeed={true}
                    profile={feed[feedIndex]}
                    afterSwipe={() => setFeedIndex(feedIndex + 1)}
                />
            }
        </StyledView>
    )
}

export const FeedMob = observer(Feed);