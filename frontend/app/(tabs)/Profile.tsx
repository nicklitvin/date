import { observer } from "mobx-react-lite";
import { PageHeader } from "../../src/components/PageHeader";
import { profileText } from "../../src/text";
import { StyledButton, StyledImage, StyledText, StyledView } from "../../src/styledElements";
import { MyButton } from "../../src/components/Button";
import axios from "axios";
import { URLs } from "../../src/urls";
import { Linking } from "react-native";
import { PublicProfile, SubscriptionData } from "../../src/interfaces";
import { createTimeoutSignal, getShortDate } from "../../src/utils";
import { useStore } from "../../src/store/RootStore";
import { Link, router } from "expo-router";

interface Props {
    openLinkFunc?: (input : string) => any
    profile?: PublicProfile
    subscription?: SubscriptionData
}

export function Profile() {
    const props : Props = {
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
    const { globalState } = useStore();

    const managePayment = async () => {
        try {
            const response = await axios.post(URLs.server + URLs.manageSubscription, null, {
                signal: createTimeoutSignal()
            });
            const url = response.data;
            if (props.openLinkFunc) {
                props.openLinkFunc(url)
            } else {
                await Linking.openURL(url);
            }
        } catch (err) {
            console.log(err);
        }
        
    }

    const cancelSubscription = async () => {
        try {
            await axios.post(URLs.server + URLs.cancelSubscription, null, {
                signal: createTimeoutSignal()
            });
        } catch (err) {
            console.log(err)
        }
    }

    const getCheckoutPage = async () => {
        try {
            const response = await axios.post(URLs.server + URLs.getCheckoutPage, null, {
                signal: createTimeoutSignal()
            });
            const url = response.data;
            if (props.openLinkFunc) {
                props.openLinkFunc(url);
            } else {
                await Linking.openURL(url);
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <StyledView className="bg-back w-full h-full">
            <PageHeader
                title={profileText.pageTitle}
                imageType="Profile"
                rightContent={
                    <Link href="/Settings">
                        <StyledImage
                            source={require("../../assets/Setting.png")}
                            className="w-[35px] h-[35px]"
                        />
                    </Link>
                }
            />
            <StyledView className="flex items-center pt-[100px]">
                <StyledImage
                    source={props.profile?.images[0]}
                    className="w-[150px] h-[150px] rounded-full"
                />
                <StyledText className="font-bold text-xl">
                    {`${props.profile?.name}, ${props.profile?.age}`}
                </StyledText>
                <StyledText className="text-xl">
                    {props.subscription?.subscribed ? profileText.premiumTier : profileText.freeTier}
                </StyledText>
                <StyledView className="w-full pt-3 flex items-center">
                    <MyButton
                        text={profileText.viewProfile}
                        onPressFunction={() => router.navigate("/ProfileView")}
                    />
                </StyledView>
                <StyledView className="w-full pt-3 flex items-center">
                    <MyButton
                        text={profileText.editProfile}
                        onPressFunction={() => router.navigate("/EditProfile")}
                    />
                </StyledView>
                {
                    props.subscription?.subscribed ? 
                    <StyledView className="flex flex-col w-full pt-5 items-center">
                        <StyledText className="font-bold text-xl">
                            {profileText.subscriptionStatus}
                        </StyledText>
                        <StyledText className="text-xl">
                            {`Next payment of $6.99 on ${getShortDate(
                                props.subscription.endDate!, globalState.timeZone
                            )}`}
                        </StyledText>
                        <StyledView className="w-full flex items-center pt-3">
                            <MyButton
                                text={profileText.managePayment}
                                onPressFunction={managePayment}
                            />
                        </StyledView>
                        <StyledView className="w-full flex items-center pt-3">
                            <MyButton
                                text={profileText.cancelSubscription}
                                onPressFunction={cancelSubscription}
                                danger={true}
                            />
                        </StyledView>
                    </StyledView> :
                    <StyledView className="w-full pt-3 flex items-center">
                        <MyButton
                            text={profileText.purchasePremium}
                            onPressFunction={getCheckoutPage}
                        />
                    </StyledView>
                }
            </StyledView>
        </StyledView>
    )
}

export const ProfileMob = observer(Profile);
export default ProfileMob;