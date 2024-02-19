import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { StyledText, StyledView } from "../styledElements";
import { feedText } from "../text";
import { PublicProfile } from "../interfaces";
import { useEffect, useState } from "react";
import { ProfileViewMob } from "./ProfileView";
import { useStore } from "../store/RootStore";
import axios from "axios";
import { URLs } from "../urls";

interface Props {
    feed: PublicProfile[]
    customLoadFeed?: PublicProfile[]
    customReturnFeedLength? (input : number) : number
    customReturnFeedIndex? (input : number) : number
}

export function Feed(props : Props) {
    const [feed, setFeed] = useState<PublicProfile[]>(props.feed ?? []);
    const [feedIndex, setFeedIndex] = useState<number>(0);
    const {globalState, savedAPICalls} = useStore();

    const loadMoreFeed = async () => {
        try {
            let moreFeed : PublicProfile[] = [];

            if (globalState.useHttp) {
                const response = await axios.post(URLs.server + URLs.getFeed);
                moreFeed = response.data;
            } else {
                moreFeed = props.customLoadFeed ?? []
            }
            setFeed(feed.concat(moreFeed));
        } catch (err) {
            console.log(err);
        }
    }

    useEffect( () => {
        if (props.customReturnFeedLength) {
            props.customReturnFeedLength(feed.length);
        }
    }, [feed])

    useEffect( () => {
        if (props.customReturnFeedIndex) {
            props.customReturnFeedIndex(feedIndex);
        }
        if (feedIndex == feed.length) {
            loadMoreFeed();
        }
    }, [feedIndex])

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