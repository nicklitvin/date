import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { profileText } from "../text";
import { StyledButton, StyledImage, StyledText, StyledView } from "../styledElements";
import { Image } from "expo-image";
import { MyButton } from "../components/Button";
import axios from "axios";
import { URLs } from "../urls";
import { Linking } from "react-native";
import { PublicProfile, SubscriptionData } from "../interfaces";
import { createTimeoutSignal, getShortDate } from "../utils";
import { globals } from "../globals";
import { useStore } from "../store/RootStore";

interface Props {
    openLinkFunc?: (input : string) => any
    profile?: PublicProfile
    subscription?: SubscriptionData
}

export function Profile(props : Props) {
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
        <>
            <PageHeader
                title={profileText.pageTitle}
                imageType="Profile"
                rightContent={
                    <StyledButton onPress={() => {}}>
                        <StyledImage
                            source={require("../../assets/Setting.png")}
                            className="w-[35px] h-[35px]"
                        />
                    </StyledButton>
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
                        onPressFunction={() => {}}
                    />
                </StyledView>
                <StyledView className="w-full pt-3 flex items-center">
                    <MyButton
                        text={profileText.editProfile}
                        onPressFunction={() => {}}
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
        </>
    )
}

export const ProfileMob = observer(Profile);