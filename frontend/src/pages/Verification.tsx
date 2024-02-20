import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../store/RootStore";
import { ConfirmVerificationInput, NewVerificationInput } from "../interfaces";
import axios from "axios";
import { URLs } from "../urls";

interface Props {

}

export function Verification(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(0);
    const {globalState, savedAPICalls} = useStore();
    const [eduEmail, setEduEmail] = useState<string>("");

    const sendVerification = async (eduEmail : string) => {
        try {
            const input : NewVerificationInput = {
                personalEmail: globalState.email!,
                schoolEmail: eduEmail
            }

            if (globalState.useHttp) {
                await axios.post(URLs.server + URLs.newVerification, input);
            } else {
                savedAPICalls.setNewVerificationInput(input);
            }

            setEduEmail(eduEmail);
        } catch (err) {
            console.log(err);
        }
    }

    const verifyCode = async (code : string) => {
        try {
            const input : ConfirmVerificationInput = {
                personalEmail: globalState.email!,
                schoolEmail: eduEmail,
                code: Number(code)
            }

            if (globalState.useHttp) {
                await axios.post(URLs.server + URLs.verifyUser, input);
            } else {
            }
        } catch (err) {
            console.log(err);
        }
    }

    switch (currentPage) {
        case 0:
            return <></>
    }
}

export const VerificationMob = observer(Verification);