import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useStore } from "../src/store/RootStore";
import { ConfirmVerificationInput, NewVerificationInput, WithKey } from "../src/interfaces";
import { URLs } from "../src/urls";
import { MySimplePage } from "../src/components/SimplePage";
import { eduEmailText, verifyCodeText } from "../src/text";
import { MyTextInput } from "../src/components/TextInput";
import { MyButton } from "../src/components/Button";
import { globals } from "../src/globals";
import { sendRequest } from "../src/utils";
import { router } from "expo-router";

interface Props {
    currentPage?: number
    eduEmail?: string
    returnCurrentPage?: (input : number) => any
    returnSeconds?: (input : number) => any
    customSeconds?: number
}

export function Verification(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.currentPage ?? 0);
    const [eduEmail, setEduEmail] = useState<string>(props.eduEmail ?? "");
    const {globalState, receivedData} = useStore();
    const [seconds, setSeconds] = useState<number>(props.customSeconds ?? globals.resendVerificationTimeout);

    useEffect( () => {
        if (props.returnSeconds) props.returnSeconds(seconds);
        if (seconds == 0) return
        const timer = setTimeout( () => setSeconds(seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds])

    useEffect( () => {
        if (props.returnCurrentPage) props.returnCurrentPage(currentPage);
    }, [currentPage])

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    }

    const sendVerification = async (eduEmail : string) => {
        try {
            const input : WithKey<NewVerificationInput> = {
                key: receivedData.loginKey,
                schoolEmail: eduEmail
            }

            await sendRequest(URLs.newVerification, input);

            setEduEmail(eduEmail);
            goToNextPage();
        } catch (err) {
            // console.log(err);
        }
    }

    const verifyCode = async (code : string) => {
        try {
            const input : WithKey<ConfirmVerificationInput> = {
                key: receivedData.loginKey,
                schoolEmail: eduEmail,
                code: Number(code)
            }
            await sendRequest(URLs.verifyUser, input);
            router.push("AccountCreation");
        } catch (err) {
            console.log(err);
        }
    }

    const resendCode = async () => {
        if (seconds > 0) return

        try {
            const input : WithKey<{}> = {
                key: receivedData.loginKey,
            }
            await sendRequest(URLs.newCode, input);
            setSeconds(globals.resendVerificationTimeout)

        } catch (err) {
            console.log(err);
        }
    }

    switch (currentPage) {
        case 0:
            return <MySimplePage
                title={eduEmailText.pageTitle}
                subtitle={eduEmailText.pageSubtitle}
                marginTop="Keyboard"
                content={<MyTextInput
                    placeholder={eduEmailText.inputPlaceholder}
                    errorMessage={eduEmailText.inputError}
                    onSubmit={sendVerification}
                />}
            />
        case 1:
            return <MySimplePage
                title={verifyCodeText.pageTitle}
                subtitle={verifyCodeText.pageSubtitle}
                marginTop="Keyboard"
                content={
                <>
                    <MyTextInput
                        placeholder={verifyCodeText.inputPlaceholder}
                        errorMessage={verifyCodeText.inputError}
                        onSubmit={verifyCode}
                    />
                    <MyButton
                        onPressFunction={resendCode}
                        text={seconds == 0 ? 
                            verifyCodeText.resendButton :
                            `${verifyCodeText.resending} ${seconds}s`
                        }
                        invertColor={seconds > 0}
                    />
                </>
                }
            />
    }
}

export const VerificationMob = observer(Verification);
export default VerificationMob;