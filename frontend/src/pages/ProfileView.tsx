import { observer } from "mobx-react-lite";
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { PageHeader } from "../components/PageHeader";
import { profileViewText } from "../text";
import { PublicProfile, SwipeInput } from "../interfaces";
import { Image } from "expo-image";
import { useStore } from "../store/RootStore";
import axios from "axios";
import { Action } from "../types";
import { testIDS } from "../testIDs";
import { URLs } from "../urls";

interface Props {
    isInSwipeFeed: boolean
    profile : PublicProfile
    afterSwipe? : Function
}

export function ProfileView(props : Props) {
    const {globalState, savedAPICalls} = useStore();

    const makeSwipe = async (opinion : Action) => {
        try {
            const input : SwipeInput = {
                swipedUserID: props.profile.id,
                action: opinion
            }
            if (globalState.useHttp) {
                await axios.post(URLs.server + URLs.makeSwipe, input);
            } else {
                savedAPICalls.setSwipeInput(input);
            }
            if (props.afterSwipe) props.afterSwipe();
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledView>
            {props.isInSwipeFeed ? null :
                <PageHeader
                    title={profileViewText.pageTitle}
                    imageSource=""
                />
            }
            <Image
                source={props.profile.images[0]}
            />
            <StyledText>
                {`${props.profile.name}, ${props.profile.age}`}
            </StyledText>
            <StyledText>
                {props.profile.description}
            </StyledText>
            <StyledView>
                {props.profile.attributes.map( attribute => (
                    <StyledText>
                        {attribute}
                    </StyledText>
                ))}
            </StyledView>
            {props.profile.images.map( (imageURL, index) => (
                index > 0 ?
                <Image
                    source={imageURL} 
                /> : null
            ))}
            {
                props.isInSwipeFeed ? 
                <>
                    <StyledButton 
                        onPress={() => makeSwipe("Like")} 
                        testID={testIDS.swipeLike}
                    />
                    <StyledButton 
                        onPress={() => makeSwipe("Dislike")}
                        testID={testIDS.swipeDislike}
                    />
                </> :
                null
            }
        </StyledView>
    )
}

export const ProfileViewMob = observer(ProfileView);