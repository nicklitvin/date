import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../styledElements";
import { PageHeader } from "../components/PageHeader";
import { profileViewText } from "../text";
import { PublicProfile, SwipeInput } from "../interfaces";
import axios from "axios";
import { Action } from "../types";
import { URLs } from "../urls";
import { PictureSeries } from "../components/PictureSeries";
import { Spacing } from "../components/Spacing";
import { MyButton } from "../components/Button";
import { createTimeoutSignal } from "../utils";
import { Frequency } from "../components/Frequency";

interface Props {
    isInSwipeFeed: boolean
    profile : PublicProfile
    afterSwipe?: Function
    ignoreRequest?: boolean
    disableSwiping?: boolean
}

export function ProfileView(props : Props) {
    const makeSwipe = async (opinion : Action) => {
        if (props.disableSwiping) return

        try {
            const input : SwipeInput = {
                swipedUserID: props.profile.id,
                action: opinion
            }
            if (!props.ignoreRequest) {
                await axios.post(URLs.server + URLs.makeSwipe, input, {
                    signal: createTimeoutSignal()
                });
            }

            if (props.afterSwipe) props.afterSwipe();
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledScroll showsVerticalScrollIndicator={false}>
        <StyledView>
            {props.isInSwipeFeed ? null :
                <PageHeader
                    title={profileViewText.pageTitle}
                    imageType="Telescope"
                />
            }
            <PictureSeries
                imageURLs={props.profile.images}
                swipable={props.isInSwipeFeed}
                swipeFunction={(opinion : Action) => makeSwipe(opinion)}
            />
            <Spacing size="lg"/>
            <StyledView className="px-5">
                <StyledText className="font-bold text-3xl">
                    {`${props.profile.name}, ${props.profile.age}`}
                </StyledText>
                <Spacing size="md"/>
                <StyledText className="text-xl">
                    {props.profile.description}
                </StyledText>
                <Spacing size="md"/>
                <StyledView className="flex flex-wrap flex-row w-full">
                    <Frequency frequency={props.profile.alcohol} habit="Alcohol"/>
                    <StyledView className="w-3"/>
                    <Frequency frequency={props.profile.smoking} habit="Smoking"/>
                </StyledView>
                <Spacing size="md"/>
                <StyledView className="flex flex-wrap flex-row w-full">
                    {props.profile.attributes.map( attribute => (
                        <MyButton
                            key={`attribute-${attribute}`}
                            onPressFunction={() => {}}
                            text={attribute}
                            smallButton={true}
                        />
                    ))}
                </StyledView>
                <Spacing size="lg"/>
            </StyledView>
        </StyledView> 
        </StyledScroll>
    )
}

export const ProfileViewMob = observer(ProfileView);