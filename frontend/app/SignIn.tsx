import { observer } from "mobx-react-lite";
import * as Google from "expo-auth-session/providers/google";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {signInText } from "../src/text";
import { StyledButton, StyledImage, StyledText, StyledView } from "../src/styledElements";
import { useStore } from "../src/store/RootStore";
import * as Apple from "expo-apple-authentication";
import { APIOutput, LoginInput, LoginOutput, PublicProfile, WithKey } from "../src/interfaces";
import { sendRequest } from "../src/utils";
import { URLs } from "../src/urls";
import { router, useNavigation } from "expo-router";
import { Spacing } from "../src/components/Spacing";
import { globals } from "../src/globals";
import { SocketManager } from "../src/components/SocketManager";
import { showToast } from "../src/components/Toast";

export function SignIn() {
    const { globalState, receivedData } = useStore();
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [allowApple, setAllowApple] = useState<boolean>(false);
    const [_, googleResponse, googlePrompt] = Google.useAuthRequest({
        androidClientId: receivedData.clientIDs?.android,
        expoClientId: receivedData.clientIDs?.expo,
        iosClientId: receivedData.clientIDs?.ios,
        redirectUri: Linking.createURL("/"),
    });
    const [loginOutput, setLoginOutput] = useState<LoginOutput|undefined>();
    const navigation = useNavigation();

    useEffect( () => {
        const func = async () => {
            setFirstLoad(false);
            if (firstLoad) {
                updateAppleAllow();
            }
        }
        func();
    })

    useEffect( () => {
        completeGoogleLogin()
    }, [googleResponse])

    const openTerms = () => {
        Linking.openURL(globals.urlTerms)
    }

    const processLoginOutput = async (output : LoginOutput) => {
        if (output.key) {
            receivedData.setLoginKey(output.key);
            globalState.setSocketManager( new SocketManager({
                socketToken: output.socketToken,
                receivedData,
                navigation: navigation
            }))
            setLoginOutput(output);
        }
    }

    const updateAppleAllow = async () => {
        setAllowApple(await Apple.isAvailableAsync());
    }

    const completeGoogleLogin = async () => {
        if (googleResponse && googleResponse.type == "success") {
            const input : LoginInput = {
                googleToken: googleResponse.authentication!.accessToken,
                expoPushToken: globalState.expoPushToken ?? undefined
            }
            try {
                const response = await sendRequest<LoginOutput>(URLs.login, input);
                if (response.message) {
                    showToast("Error",response.message)
                } else if (response.data) {
                    await processLoginOutput(response.data);
                }
            } catch (err) { 
                console.log(err);
            }
        }
    }

    useEffect( () => {
        if (!loginOutput) return

        const func = async () => {
            if (loginOutput.banned) return router.push("Reported");

            if (!loginOutput.newAccount) {
                try {
                    const input : WithKey<{}> = {
                        key: loginOutput.key
                    }
                    const response = await sendRequest<PublicProfile>(URLs.getMyProfile,input);
                    if (response.message) {
                        showToast("Error", response.message)
                    } else if (response.data) {
                        receivedData.setProfile(response.data);
                        return router.push("(tabs)")
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            if (loginOutput.verified) return router.push("AccountCreation")
            else return router.push("Verification")
        }

        func();
    }, [loginOutput])

    const googleLogin = async () => {
        try {
            await googlePrompt();
        } catch (err) {
            console.log(err);
        }
    }

    const appleLogin = async () => {
        try {
            const iosData = await Apple.signInAsync({
                requestedScopes: [
                    Apple.AppleAuthenticationScope.EMAIL
                ]
            })
            const input : LoginInput = {
                appleToken: iosData.identityToken ?? undefined,
                expoPushToken: globalState.expoPushToken ?? undefined
            }

            const response = await sendRequest<LoginOutput>(URLs.login, input);
            if (response.message) {
                showToast("Error",response.message)
            } else if (response.data) {
                await processLoginOutput(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    }
    
    return (
        <StyledView className="flex-grow bg-back p-5">
            <StyledView className="flex flex-row w-full items-center justify-center mt-[200px]">
                <StyledText className={`text-4xl font-bold text-center`}>
                    {signInText.pageTitle}
                </StyledText>
                <StyledImage
                    source={require("../assets/icon-transparent.png")}
                    className="w-[75px] h-[75px]"
                />
            </StyledView>
            <StyledText className={`text-xl text-center mb-5`}>
                {signInText.pageSubtitle}
            </StyledText>
            <StyledView className="flex flex-grow"/>
            <StyledView className="flex flex-col w-full items-center">
                {allowApple ? 
                    <StyledView className="w-4/5 p-5">
                        <Apple.AppleAuthenticationButton
                            buttonType={Apple.AppleAuthenticationButtonType.SIGN_IN}
                            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
                            cornerRadius={20}
                            onPress={appleLogin}
                            style={{
                                width: "100%"
                            }}
                        />
                    </StyledView> : null
                }
                <StyledButton
                    className="w-4/5 bg-front p-5 rounded-xl"
                    onPress={googleLogin}
                >
                    <StyledText className="text-back text-center font-bold text-xl">
                        {signInText.googleSignIn}
                    </StyledText>
                </StyledButton>
                <Spacing size="lg"/>
                <StyledButton onPress={openTerms}>
                    <StyledText 
                        className="text-lg underline" 
                    >
                        {signInText.terms}
                    </StyledText>
                </StyledButton>
                <Spacing size="md"/>
                <StyledText className="text-lg">
                    {signInText.version}
                </StyledText>
            </StyledView>
        </StyledView>
    )
}

export const SignInMob = observer(SignIn);
export default SignInMob;