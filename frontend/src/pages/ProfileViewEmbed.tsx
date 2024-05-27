import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../styledElements";
import { PageHeader } from "../components/PageHeader";
import { profileText, profileViewText } from "../text";
import { PublicProfile, UserReportWithReportedID, SwipeInput, WithKey, Opinion } from "../interfaces";
import axios from "axios";
import { URLs } from "../urls";
import { PictureSeries } from "../components/PictureSeries";
import { Spacing } from "../components/Spacing";
import { MyButton } from "../components/Button";
import { createTimeoutSignal, sendRequest } from "../utils";
import { Frequency } from "../components/Frequency";
import Toast from "react-native-toast-message";

interface Props {
    isInSwipeFeed: boolean
    profile : PublicProfile
    afterSwipe?: Function
    ignoreRequest?: boolean
    disableSwiping?: boolean
    reportable?: boolean
    likedMe?: boolean
    loginKey?: string
    userID?: string
}

export function ProfileViewEmbed(props : Props) {
    const makeSwipe = async (opinion : Opinion) => {
        if (props.disableSwiping) return
        try {
            const input : WithKey<SwipeInput> = {
                userID: props.userID!,
                swipedUserID: props.profile.id,
                action: opinion,
                key: props.loginKey
            }
            if (!props.ignoreRequest) {
                const response = await sendRequest<{}>(URLs.makeSwipe, input);
                if (response.message) {
                    return Toast.show({
                        type: "error",
                        text1: response.message
                    })
                }
            }

            if (props.afterSwipe) props.afterSwipe();
        } catch (err) {
            console.log(err);
        }
    }

    const reportUser = async () => {
        try {
            const myReport : WithKey<UserReportWithReportedID> = {
                userID: props.userID!,
                reportedID: props.profile.id,
                key: props.loginKey
            }
            if (!props.ignoreRequest) {
                const response = await sendRequest<{}>(URLs.reportUser, myReport);
                if (response.message) {
                    Toast.show({
                        type: "error",
                        text1: response.message
                    })
                    return
                } 
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
                imageURLs={props.profile.images.map(val => val.url)}
                swipable={props.isInSwipeFeed}
                swipeFunction={(opinion : Opinion) => makeSwipe(opinion)}
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