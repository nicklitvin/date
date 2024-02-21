import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useStore } from "../store/RootStore";
import { ConfirmVerificationInput, NewCodeInput, NewVerificationInput } from "../interfaces";
import axios from "axios";
import { URLs } from "../urls";
import { MySimplePage } from "../components/SimplePage";
import { eduEmailText, verifyCodeText } from "../text";
import { MyTextInput } from "../components/TextInput";
import { MyButton } from "../components/Button";
import { differenceInMinutes } from "date-fns";
import { globals } from "../globals";

interface Props {
    currentPage?: number
    eduEmail?: string
    lastSend? : Date
    returnCurrentPage?: (input : number) => number
}

export function Verification(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.currentPage ?? 0);
    const [eduEmail, setEduEmail] = useState<string>(props.eduEmail ?? "");
    const [lastSend, setLastSend] = useState<Date>(props.lastSend ?? new Date());
    const {globalState} = useStore();

    useEffect( () => {
        if (props.returnCurrentPage) props.returnCurrentPage(currentPage);
    }, [currentPage])

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    }

    const sendVerification = async (eduEmail : string) => {
        try {
            const input : NewVerificationInput = {
                personalEmail: globalState.email!,
                schoolEmail: eduEmail
            }

            await axios.post(URLs.server + URLs.newVerification, input);

            setEduEmail(eduEmail);
            goToNextPage();
        } catch (err) {
            // console.log(err);
        }
    }

    const verifyCode = async (code : string) => {
        try {
            const input : ConfirmVerificationInput = {
                personalEmail: globalState.email!,
                schoolEmail: eduEmail,
                code: Number(code)
            }
            const response = await axios.post(URLs.server + URLs.verifyUser, input);
        } catch (err) {
            console.log(err);
        }
    }

    const resendCode = async () => {
        if (differenceInMinutes(new Date(), lastSend) < globals.minutesBeforeResend) return 

        try {
            const input : NewCodeInput = {
                personalEmail: globalState.email!
            }
            await axios.post(URLs.server + URLs.newCode, input);
            setLastSend(new Date());

        } catch (err) {
            console.log(err);
        }
    }

    switch (currentPage) {
        case 0:
            return <MySimplePage
                title={eduEmailText.pageTitle}
                subtitle={eduEmailText.pageSubtitle}
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
                content={
                <>
                    <MyTextInput
                        placeholder={verifyCodeText.inputPlaceholder}
                        errorMessage={verifyCodeText.inputError}
                        onSubmit={verifyCode}
                    />
                    <MyButton
                        onPressFunction={resendCode}
                        text={verifyCodeText.resendButton}
                    />
                </>
                }
            />
    }
}

export const VerificationMob = observer(Verification);