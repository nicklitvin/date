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
import { sendRequest, setCustomTimer } from "../src/utils";
import { router } from "expo-router";
import { showToast } from "../src/components/Toast";
import { Spacing } from "../src/components/Spacing";

interface Props {
    currentPage?: number
    eduEmail?: string
    returnCurrentPage?: (input : number) => any
    returnSeconds?: (input : number) => any
    customSeconds?: number
    noRouter?: boolean
    disableToast?: boolean
}

export function Verification(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.currentPage ?? 0);
    const [eduEmail, setEduEmail] = useState<string>(props.eduEmail ?? "");
    const { receivedData} = useStore();
    const [seconds, setSeconds] = useState<number>(props.customSeconds ?? 0);
    const [timer, setTimer] = useState<NodeJS.Timeout|undefined>(undefined);

    useEffect( () => {
        if (props.returnSeconds) props.returnSeconds(seconds);
        if (seconds == 0) return
        
        if (timer) clearTimeout(timer);
        const newTimer = setCustomTimer( () => setSeconds(seconds - 1), 1);
        setTimer(newTimer);
        return
    }, [seconds])

    useEffect( () => {
        if (props.returnCurrentPage) props.returnCurrentPage(currentPage);
    }, [currentPage])

    const goToNextPage = () => {
        setSeconds(globals.resendVerificationTimeout)
        setCurrentPage(currentPage + 1);
    }

    const sendVerification = async (eduEmail : string) => {
        try {
            const input : WithKey<NewVerificationInput> = {
                key: receivedData.loginKey,
                schoolEmail: eduEmail
            }

            const response = await sendRequest<void>(URLs.newVerification, input);

            if (response.message) {
                if (!props.disableToast) showToast("Error", response.message);
            } else {
                setEduEmail(eduEmail);
                goToNextPage();
            }
        } catch (err) {
            console.log(err);
        }
    }

    const verifyCode = async (code : string) => {
        try {
            const input : WithKey<ConfirmVerificationInput> = {
                key: receivedData.loginKey,
                schoolEmail: eduEmail,
                code: Number(code)
            }
            const response = await sendRequest<void>(URLs.verifyUser, input);
            if (response.message) {
                if (!props.disableToast) showToast("Error", response.message);
            } else {
                if (!props.noRouter) router.replace("AccountCreation");
            }
        } catch (err) {
            console.log(err);
        }
    }

    const resendCode = async () => {
        if (seconds > 0) return

        try {
            const input : WithKey<{}> = {
                key: receivedData.loginKey
            }
            const response = await sendRequest<void>(URLs.newCode, input);
            if (response.message) {
                if (!props.disableToast) showToast("Error", response.message);
            } else {
                setSeconds(globals.resendVerificationTimeout)
            }
        } catch (err) {
            console.log(err);
        }
    }

    switch (currentPage) {
        case 0:
            return <MySimplePage
                title={eduEmailText.pageTitle}
                subtitle={eduEmailText.pageSubtitle}
                pageType="Keyboard"
                content={
                    <MyTextInput
                        placeholder={eduEmailText.inputPlaceholder}
                        errorMessage={eduEmailText.inputError}
                        onSubmit={sendVerification}
                        dontClearAfterSubmit={true}
                    />
                }
            />
        case 1:
            return <MySimplePage
                title={verifyCodeText.pageTitle}
                subtitle={verifyCodeText.pageSubtitle}
                pageType="Keyboard"
                content={
                <>
                    <MyTextInput
                        placeholder={verifyCodeText.inputPlaceholder}
                        errorMessage={verifyCodeText.inputError}
                        onSubmit={verifyCode}
                    />
                    <Spacing size="lg"/>
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