import { globals } from "../globals";
import { StyledImage, StyledText, StyledView } from "../styledElements";

type ToastType = "Success" | "Error";
export interface MyToastProps {
    text: string
}


const shortenTextIfNeeded = (text : string) : string => {
    if (text.length > globals.maxNotificationLength) {
        return text.slice(0,globals.maxNotificationLength - 3) + "..."
    };
    return text;
}
 
const makeToast = (props : any, toastType : ToastType) => {
    const myProps = props.props as MyToastProps;
    if (!myProps.text) return

    let image;

    switch (toastType) {
        case "Success": image = require("../../assets/Success.png"); break;
        case "Error": image = require("../../assets/Fail.png"); break;
    }

    if (!image) return

    return (
        <StyledView className="flex flex-row items-center bg-white px-6 py-3 rounded-md">
            <StyledImage
                source={image}
                className="w-[25px] h-[25px]"
            />
            <StyledText className="text-left text-lg pl-4">
                {shortenTextIfNeeded(myProps.text)}
            </StyledText>
        </StyledView>
    )
}

export const toastConfig = {
    success: (props : any) => makeToast(props,"Success"),
    error: (props : any) => makeToast(props,"Error"),

}