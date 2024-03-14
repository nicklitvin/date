import { observer } from "mobx-react-lite";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../src/styledElements";
import { PageHeader } from "../src/components/PageHeader";
import { profileText, profileViewText } from "../src/text";
import { PublicProfile, RequestReportInput, SwipeInput } from "../src/interfaces";
import axios from "axios";
import { Action } from "../src/types";
import { URLs } from "../src/urls";
import { PictureSeries } from "../src/components/PictureSeries";
import { Spacing } from "../src/components/Spacing";
import { MyButton } from "../src/components/Button";
import { createTimeoutSignal } from "../src/utils";
import { Frequency } from "../src/components/Frequency";

interface Props {
    isInSwipeFeed: boolean
    profile : PublicProfile
    afterSwipe?: Function
    ignoreRequest?: boolean
    disableSwiping?: boolean
    reportable?: boolean
}

export function ProfileView() {
    const props : Props = {
        isInSwipeFeed: false,
        profile: {
            name: "Michael",
            age: 21,
            attributes: ["asd","asrqd", "asdnw", "ajshdkasdsa", "ajljshdwgeiqw"],
            description: "this is a desceiption askdh askdjh aks dhsk ds dkas daksj daks kad jhask dajsh kasdhjasdhask das dhaskd ask dashd ",
            gender: "Male",
            id: "abc",
            images: [
                "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*",
                "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
            ],
            alcohol: "Often",
            smoking: "Often",
        }
    }

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

    const reportUser = async () => {
        try {
            const myReport : RequestReportInput = {
                reportedID: props.profile.id
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
        <StyledView className="w-full h-full bg-back">
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

export const ProfileViewMob = observer(ProfileView);
export default ProfileViewMob;