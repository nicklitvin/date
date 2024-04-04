import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../styledElements";
import { PageHeader } from "../components/PageHeader";
import { profileText, profileViewText } from "../text";
import { PublicProfile, UserReportWithReportedID, SwipeInput, WithKey } from "../interfaces";
import axios from "axios";
import { Action } from "../types";
import { URLs } from "../urls";
import { PictureSeries } from "../components/PictureSeries";
import { Spacing } from "../components/Spacing";
import { MyButton } from "../components/Button";
import { createTimeoutSignal, sendRequest } from "../utils";
import { Frequency } from "../components/Frequency";

interface Props {
    isInSwipeFeed: boolean
    profile : PublicProfile
    afterSwipe?: Function
    ignoreRequest?: boolean
    disableSwiping?: boolean
    reportable?: boolean
    likedMe?: boolean
    loginKey?: string
}

export function ProfileViewEmbed(props : Props) {
    const makeSwipe = async (opinion : Action) => {
        if (props.disableSwiping) return
        try {
            const input : WithKey<SwipeInput> = {
                swipedUserID: props.profile.id,
                action: opinion,
                key: props.loginKey
            }
            if (!props.ignoreRequest) {
                await sendRequest(URLs.makeSwipe, input);
            }

            if (props.afterSwipe) props.afterSwipe();
        } catch (err) {
            console.log(err);
        }
    }

    const reportUser = async () => {
        try {
            const myReport : WithKey<UserReportWithReportedID> = {
                reportedID: props.profile.id,
                key: props.loginKey
            }
            if (!props.ignoreRequest) {
                await axios.post(URLs.server + URLs.reportUser, myReport, {
                    signal: createTimeoutSignal()
                })
            }
            if (props.afterSwipe) props.afterSwipe()
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
                <StyledView className="w-full flex-row items-center">
                    <StyledText className="font-bold text-3xl">
                        {`${props.profile.name}, ${props.profile.age}`}
                    </StyledText>
                    {
                        props.likedMe ? 
                        <MyButton
                            text={profileViewText.likedMe}
                            onPressFunction={() => {}}
                            smallButton={true}
                            invertColor={true}
                            disable={true}
                        /> : null
                    }
                </StyledView>
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
                            disable={true}
                        />
                    ))}
                </StyledView>
                { props.reportable ?
                    <StyledView className="w-full items-center flex">
                        <Spacing size="lg"/>

                        <MyButton
                            text={profileViewText.reportUser}
                            onPressFunction={reportUser}
                            danger={true}
                        />
                    </StyledView> : null
                }
                
                <Spacing size="lg"/>
            </StyledView>
        </StyledView> 
        </StyledScroll>
    )
}

export const ProfileViewEmbedMob = observer(ProfileViewEmbed);