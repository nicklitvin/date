import { BaseToast } from "react-native-toast-message";
import { globals } from "../globals";

type ToastType = "Success" | "Error";

const makeToast = (props : any, toastType : ToastType) => (
    <BaseToast
        {...props}
        style={{
            borderRadius: 25,
            backgroundColor: globals.light,
            // borderColor: globals.red
            borderColor: toastType == "Success" ? globals.green : globals.red
        }}
        text1Style={{
            fontSize: 12,
            color: globals.dark
        }}
        text2Style={{
            fontSize: 10,
            color: globals.dark
        }}
    />
)

export const toastConfig = {
    success: (props : any) => makeToast(props,"Success"),
    error: (props : any) => makeToast(props,"Error")
}