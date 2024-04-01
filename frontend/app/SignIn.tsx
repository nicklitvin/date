import { observer } from "mobx-react-lite";
import * as Google from "expo-auth-session/providers/google";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { MySimplePage } from "../src/components/SimplePage";
import { homeText } from "../src/text";
import { StyledButton, StyledText } from "../src/styledElements";
import { useStore } from "../src/store/RootStore";
import * as Apple from "expo-apple-authentication";
import { LoginInput, LoginOutput } from "../src/interfaces";
import { sendRequest } from "../src/utils";
import { URLs } from "../src/urls";
import { Redirect, router } from "expo-router";

export function Home() {
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

    useEffect( () => {
        const func = async () => {
            if (firstLoad) {
                updateAppleAllow();
            }
            setFirstLoad(false);
        }
        func();
    })

    useEffect( () => {
        completeGoogleLogin()
    }, [googleResponse])

    const processLoginOutput = async (output : LoginOutput) => {
        receivedData.setLoginKey(output.key);
        setLoginOutput(output);
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
                const response = await sendRequest(URLs.login, input);
                await processLoginOutput(response.data.data as LoginOutput);
            } catch (err) { 
                console.log(err);
            }
        }
    }

    useEffect( () => {
        if (loginOutput) {
            if (!loginOutput.newAccount) return router.push("(tabs)")
            if (loginOutput.verified) return router.push("AccountCreation")
            else return router.push("Verification")
        }
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

            const response = await sendRequest(URLs.login, input);
            await processLoginOutput(response.data);
        } catch (err) {
            console.log(err);
        }
    }
    
    return (
        <MySimplePage
            title={homeText.pageTitle}
            subtitle=""
            content={
                <>
                    {allowApple ? 
                        <Apple.AppleAuthenticationButton
                            buttonType={Apple.AppleAuthenticationButtonType.SIGN_IN}
                            buttonStyle={Apple.AppleAuthenticationButtonStyle.BLACK}
                            cornerRadius={20}
                            onPress={appleLogin}
                            style={{
                                width: "100%"
                            }}
                        /> : null
                    }
                    <StyledButton
                        className="w-4/5 bg-front p-5 rounded-xl"
                        onPress={googleLogin}
                    >
                        <StyledText className="text-back text-center font-bold text-xl">
                            Sign In With Google
                        </StyledText>
                    </StyledButton>
                </>
                
            }
        />
    )
}

export const HomeMob = observer(Home);
export default HomeMob;