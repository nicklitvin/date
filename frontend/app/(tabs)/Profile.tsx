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
}

export function Profile(props : Props) {
    const { globalState, receivedData } = useStore();

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
                    source={receivedData.profile?.images[0]}
                    className="w-[150px] h-[150px] rounded-full"
                />
                <StyledText className="font-bold text-xl">
                    {`${receivedData.profile?.name}, ${receivedData.profile?.age}`}
                </StyledText>
                <StyledText className="text-xl">
                    {receivedData.subscription?.subscribed ? profileText.premiumTier : profileText.freeTier}
                </StyledText>
                <StyledView className="w-full pt-3 flex items-center">
                    <MyButton
                        text={profileText.viewProfile}
                        onPressFunction={() => router.navigate(`/ProfileView?userID=${receivedData.profile?.id}`)}
                    />
                </StyledView>
                <StyledView className="w-full pt-3 flex items-center">
                    <MyButton
                        text={profileText.editProfile}
                        onPressFunction={() => router.navigate("/EditProfile")}
                    />
                </StyledView>
                {
                    receivedData.subscription?.subscribed ? 
                    <StyledView className="flex flex-col w-full pt-5 items-center">
                        <StyledText className="font-bold text-xl">
                            {profileText.subscriptionStatus}
                        </StyledText>
                        <StyledText className="text-xl">
                            {`Next payment of $6.99 on ${getShortDate(
                                receivedData.subscription.endDate!, globalState.timeZone
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