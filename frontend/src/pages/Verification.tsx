// import { observer } from "mobx-react-lite";
// import { useEffect, useState } from "react";
// import { useStore } from "../store/RootStore";
// import { ConfirmVerificationInput, NewCodeInput, NewVerificationInput } from "../interfaces";
// import axios from "axios";
// import { URLs } from "../urls";
// import { MySimplePage } from "../components/SimplePage";
// import { eduEmailText, verifyCodeText } from "../text";
// import { MyTextInput } from "../components/TextInput";
// import { MyButton } from "../components/Button";
// import { differenceInMinutes, differenceInSeconds } from "date-fns";
// import { globals } from "../globals";

// interface Props {
//     currentPage?: number
//     eduEmail?: string
//     returnCurrentPage?: (input : number) => number
//     returnSeconds?: (input : number) => any
//     customSeconds?: number
// }

// export function Verification(props : Props) {
//     const [currentPage, setCurrentPage] = useState<number>(props.currentPage ?? 0);
//     const [eduEmail, setEduEmail] = useState<string>(props.eduEmail ?? "");
//     const {globalState} = useStore();
//     const [seconds, setSeconds] = useState<number>(props.customSeconds ?? globals.resendVerificationTimeout);

//     useEffect( () => {
//         if (props.returnSeconds) props.returnSeconds(seconds);
//         if (seconds == 0) return
//         const timer = setTimeout( () => setSeconds(seconds - 1), 1000);
//         return () => clearTimeout(timer);
//     }, [seconds])

//     useEffect( () => {
//         if (props.returnCurrentPage) props.returnCurrentPage(currentPage);
//     }, [currentPage])

//     const goToNextPage = () => {
//         setCurrentPage(currentPage + 1);
//     }

//     const sendVerification = async (eduEmail : string) => {
//         try {
//             const input : NewVerificationInput = {
//                 personalEmail: globalState.email!,
//                 schoolEmail: eduEmail
//             }

//             await axios.post(URLs.server + URLs.newVerification, input);

//             setEduEmail(eduEmail);
//             goToNextPage();
//         } catch (err) {
//             // console.log(err);
//         }
//     }

//     const verifyCode = async (code : string) => {
//         try {
//             const input : ConfirmVerificationInput = {
//                 personalEmail: globalState.email!,
//                 schoolEmail: eduEmail,
//                 code: Number(code)
//             }
//             const response = await axios.post(URLs.server + URLs.verifyUser, input);
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     const resendCode = async () => {
//         if (seconds > 0) return

//         try {
//             const input : NewCodeInput = {
//                 personalEmail: globalState.email!
//             }
//             await axios.post(URLs.server + URLs.newCode, input);
//             setSeconds(globals.resendVerificationTimeout)

//         } catch (err) {
//             console.log(err);
//         }
//     }

//     switch (currentPage) {
//         case 0:
//             return <MySimplePage
//                 title={eduEmailText.pageTitle}
//                 subtitle={eduEmailText.pageSubtitle}
//                 marginTop="Keyboard"
//                 content={<MyTextInput
//                     placeholder={eduEmailText.inputPlaceholder}
//                     errorMessage={eduEmailText.inputError}
//                     onSubmit={sendVerification}
//                 />}
//             />
//         case 1:
//             return <MySimplePage
//                 title={verifyCodeText.pageTitle}
//                 subtitle={verifyCodeText.pageSubtitle}
//                 marginTop="Keyboard"
//                 content={
//                 <>
//                     <MyTextInput
//                         placeholder={verifyCodeText.inputPlaceholder}
//                         errorMessage={verifyCodeText.inputError}
//                         onSubmit={verifyCode}
//                     />
//                     <MyButton
//                         onPressFunction={resendCode}
//                         text={seconds == 0 ? 
//                             verifyCodeText.resendButton :
//                             `${verifyCodeText.resending} ${seconds}s`
//                         }
//                         invertColor={seconds > 0}
//                     />
//                 </>
//                 }
//             />
//     }
// }

// export const VerificationMob = observer(Verification);