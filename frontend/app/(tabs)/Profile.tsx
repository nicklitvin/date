import { observer } from "mobx-react-lite";
import { PageHeader } from "../../src/components/PageHeader";
import { profileText } from "../../src/text";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { MyButton } from "../../src/components/Button";
import { URLs } from "../../src/urls";
import { Linking, RefreshControl } from "react-native";
import { JustUserID, PublicProfile, SubscriptionData, WithKey } from "../../src/interfaces";
import { getShortDate, sendRequest } from "../../src/utils";
import { useStore } from "../../src/store/RootStore";
import { Link, router } from "expo-router";
import { testIDS } from "../../src/testIDs";
import { useEffect, useState } from "react";
import Loading from "../Loading";
import Toast from "react-native-toast-message";

interface Props {
    openLinkFunc?: (input : string) => any
    dontAutoLoad?: boolean
}

export function Profile(props : Props) {
    const { globalState, receivedData } = useStore();
    const savedProfile = receivedData.profile;
    const savedSubscription = receivedData.subscription;
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (props.dontAutoLoad) return
            load();   
        }
    }, [firstLoad])

    const load = async (refresh = false) => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }

            if (refresh || !savedProfile) {
                const profileResponse = await sendRequest<PublicProfile>(URLs.getMyProfile, input);
                if (profileResponse.data) receivedData.setProfile(profileResponse.data);
            }
            

            if (refresh || !savedSubscription) {
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
            const response = await sendRequest(URLs.cancelSubscription, input);
            if (response.message) {
                Toast.show({
                    type: "error",
                    props: {text: response.message},
                })
            } else {
                receivedData.setSubscription({
                    ...receivedData.subscription,
                    subscribed: false,
                })
                Toast.show({
                    type: "success",
                    props: {text: profileText.subscriptionCanceled}
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getCheckoutPage = async () => {
        try {
            const input : JustUserID = {
                userID: receivedData.profile?.id!,
            }
            const response = await sendRequest<string>(URLs.getPremiumPage,input);
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

    const makeSubscriptionContent = () => {
        if (!savedSubscription) return 

        if (savedSubscription.subscribed) {
            return (
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
                </StyledView>
            )
        } else if (savedSubscription.endDate && savedSubscription.endDate.getTime() > new Date().getTime()) {
            return (
                <StyledView className="w-full pt-3 flex items-center">
                    <StyledText className="font-bold text-xl">
                        {profileText.subscriptionStatus}
                    </StyledText>
                    <StyledText className="text-xl">
                        {`Premium is expiring on ${getShortDate(
                            savedSubscription.endDate, globalState.timeZone
                        )}`}
                    </StyledText>
                    <StyledView className="w-full flex items-center pt-3">
                        <MyButton
                            text={profileText.purchasePremium}
                            onPressFunction={getCheckoutPage}
                        />
                    </StyledView>
                </StyledView>
            )
        } else {
            return (
                <StyledView className="w-full pt-3 flex items-center">
                    <MyButton
                        text={profileText.purchasePremium}
                        onPressFunction={getCheckoutPage}
                    />
                </StyledView>
            )
        }
    }

    const refresh = async () => {
        await load(true)
        setRefreshing(false);
    }

    if ( (!savedProfile || !savedSubscription) && !props.dontAutoLoad) {
        return <Loading/>   
    }
    return (
        <StyledView className="bg-back w-full h-full">
        <StyledScroll
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refresh}    
                />
            }
        >
            <StyledButton testID={testIDS.load} onPress={() => load()}/>
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
                    {
                        (savedSubscription?.subscribed || 
                            (
                                savedSubscription?.endDate &&
                                savedSubscription?.endDate?.getTime() > new Date().getTime() 
                            ) 
                        ) ? 
                        profileText.premiumTier : 
                        profileText.freeTier}
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
                {makeSubscriptionContent()}
            </StyledView>
        </StyledScroll>
        </StyledView>
    )
}

export const ProfileMob = observer(Profile);
export default ProfileMob;