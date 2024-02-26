import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { profileText } from "../text";
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { Image } from "expo-image";
import { MyButton } from "../components/Button";
import axios from "axios";
import { URLs } from "../urls";
import { Linking } from "react-native";
import { PublicProfile, SubscriptionData } from "../interfaces";

interface Props {
    openLinkFunc?: (input : string) => any
    profile?: PublicProfile
    subscription?: SubscriptionData
}

export function Profile(props : Props) {
    const managePayment = async () => {
        const response = await axios.post(URLs.server + URLs.manageSubscription);
        const url = response.data;
        if (props.openLinkFunc) {
            props.openLinkFunc(url)
        } else {
            await Linking.openURL(url);
        }
    }

    const cancelSubscription = async () => {
        try {
            await axios.post(URLs.server + URLs.cancelSubscription);
        } catch (err) {}
    }

    const getCheckoutPage = async () => {
        try {
            const response = await axios.post(URLs.server + URLs.getCheckoutPage);
            const url = response.data;
            if (props.openLinkFunc) {
                props.openLinkFunc(url);
            } else {
                await Linking.openURL(url);
            }
        } catch (err) {}
    }

    return (
        <>
            <PageHeader
                title={profileText.pageTitle}
                imageSource=""
                rightContent={
                    <StyledButton onPress={() => {}}>
                        <Image
                            source={props.profile?.images[0]}
                        />
                    </StyledButton>
                }
            />
            <StyledView>
                <Image
                    source=""
                />
                <StyledText>
                    {`${props.profile?.name}, ${props.profile?.age}`}
                </StyledText>
                <StyledText>
                    {props.subscription?.subscribed ? profileText.premiumTier : profileText.freeTier}
                </StyledText>
                <MyButton
                    text={profileText.viewProfile}
                    onPressFunction={() => {}}
                />
                {
                    props.subscription?.subscribed ? 
                    <>
                        <StyledText>
                            {profileText.subscriptionStatus}
                        </StyledText>
                        <StyledText>
                            {`Next payment of $6.99 on ${props.subscription.endDate}`}
                        </StyledText>
                        <MyButton
                            text={profileText.managePayment}
                            onPressFunction={managePayment}
                        />
                        <MyButton
                            text={profileText.cancelSubscription}
                            onPressFunction={cancelSubscription}
                        />
                    </> :
                    <MyButton
                        text={profileText.purchasePremium}
                        onPressFunction={getCheckoutPage}
                    />
                }
            </StyledView>
        </>
    )
}

export const ProfileMob = observer(Profile);