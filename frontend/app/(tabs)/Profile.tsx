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
    const savedProfile = receivedData.profile;
    const savedSubscription = receivedData.subscription;
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (props.dontAutoLoad) return
            load();   
        }
    }, [firstLoad])

    const load = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }

            if (!savedProfile) {
                const profileResponse = await sendRequest<PublicProfile>(URLs.getMyProfile, input);
                if (profileResponse.data) receivedData.setProfile(profileResponse.data);
            }

            if (!savedSubscription) {
                const subscriptionResponse = await sendRequest<SubscriptionData>(URLs.getSubscription, input);
                if (subscriptionResponse.data) receivedData.setSubscription({
                    ...subscriptionResponse.data,
                    endDate: new Date(subscriptionResponse.data.endDate!)

                });
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
            const response = await sendRequest<string>(URLs.manageSubscription, input);

            if (response.data) {
                if (props.openLinkFunc) {
                    props.openLinkFunc(response.data)
                } else {
                    await Linking.openURL(response.data);
                }
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
            const response = await sendRequest<string>(URLs.getCheckoutPage,input);
            if (response.data) {
                if (props.openLinkFunc) {
                    props.openLinkFunc(response.data);
                } else {
                    await Linking.openURL(response.data);
                }
            }
            
        } catch (err) {
            console.log(err)
        }
    }

    if ( (!savedProfile || !savedSubscription) && !props.dontAutoLoad) {
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
                    source={savedProfile?.images[0].url}
                    className="w-[150px] h-[150px] rounded-full"
                />
                <StyledText className="font-bold text-xl">
                    {`${savedProfile?.name}, ${savedProfile?.age}`}
                </StyledText>
                <StyledText className="text-xl">
                    {savedSubscription?.subscribed ? profileText.premiumTier : profileText.freeTier}
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
                    savedSubscription?.subscribed ? 
                    <StyledView className="flex flex-col w-full pt-5 items-center">
                        <StyledText className="font-bold text-xl">
                            {profileText.subscriptionStatus}
                        </StyledText>
                        <StyledText className="text-xl">
                            {`Next payment of $6.99 on ${getShortDate(
                                savedSubscription.endDate!, globalState.timeZone
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