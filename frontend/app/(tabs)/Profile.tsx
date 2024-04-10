import { observer } from "mobx-react-lite";
import { PageHeader } from "../../src/components/PageHeader";
import { profileText } from "../../src/text";
import { StyledButton, StyledImage, StyledText, StyledView } from "../../src/styledElements";
import { MyButton } from "../../src/components/Button";
import { URLs } from "../../src/urls";
import { Linking } from "react-native";
import { JustUserID, PublicProfile, SubscriptionData, WithKey } from "../../src/interfaces";
import { getShortDate, sendRequest } from "../../src/utils";
import { useStore } from "../../src/store/RootStore";
import { Link, router } from "expo-router";
import { testIDS } from "../../src/testIDs";
import { useEffect, useState } from "react";
import Loading from "../Loading";

interface Props {
    openLinkFunc?: (input : string) => any
    dontAutoLoad?: boolean
}

export function Profile(props : Props) {
    const { globalState, receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    const [subscription, setSubscription] = useState<SubscriptionData|null>(
        receivedData.subscription
    )
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (props.dontAutoLoad) return
            load();   
        }
    }, [firstLoad])

    useEffect( () => {
        if (profile && !receivedData.profile) {
            receivedData.setProfile(profile)
        }
    }, [profile])

    useEffect( () => {
        if (subscription && !receivedData.subscription) {
            receivedData.setSubscription(subscription);
        }
    }, [subscription])

    const load = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }

            if (!profile) {
                const profileResponse = await sendRequest(URLs.getMyProfile, input);
                setProfile(profileResponse.data.data);
            }

            if (!subscription) {
                const subscriptionResponse = await sendRequest(URLs.getSubscription, input);
                setSubscription(subscriptionResponse.data.data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const managePayment = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            const response = await sendRequest(URLs.manageSubscription, input);
            const url = response.data.data;
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
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            await sendRequest(URLs.cancelSubscription, input);
        } catch (err) {
            console.log(err)
        }
    }

    const getCheckoutPage = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            const response = await sendRequest(URLs.getCheckoutPage,input);
            const url = response.data.data;
            if (props.openLinkFunc) {
                props.openLinkFunc(url);
            } else {
                await Linking.openURL(url);
            }
        } catch (err) {
            console.log(err)
        }
    }

    if (!profile && !props.dontAutoLoad) {
        return <Loading/>   
    }
    return (
        <StyledView className="bg-back w-full h-full">
            <StyledButton testID={testIDS.load} onPress={load}/>
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
                    source={profile?.images[0].url}
                    className="w-[150px] h-[150px] rounded-full"
                />
                <StyledText className="font-bold text-xl">
                    {`${profile?.name}, ${profile?.age}`}
                </StyledText>
                <StyledText className="text-xl">
                    {subscription?.subscribed ? profileText.premiumTier : profileText.freeTier}
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
                    subscription?.subscribed ? 
                    <StyledView className="flex flex-col w-full pt-5 items-center">
                        <StyledText className="font-bold text-xl">
                            {profileText.subscriptionStatus}
                        </StyledText>
                        <StyledText className="text-xl">
                            {`Next payment of $6.99 on ${getShortDate(
                                subscription.endDate!, globalState.timeZone
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