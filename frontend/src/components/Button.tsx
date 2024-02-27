import classNames from "classnames";
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { TouchableOpacity } from "react-native";

interface Props {
    text: string
    onPressFunction: () => any,
    invertColor?: boolean 
    danger?: boolean
}

export function MyButton(props : Props) {
    return (
        <StyledButton
            onPress={props.onPressFunction}
            className={classNames(
                "rounded-[50px] px-10 py-3 w-3/5",
                props.invertColor ? "bg-front" : "bg-back border border-front",

            )}
        >
            <StyledText className={classNames(
                "font-bold text-center text-lg",
                props.danger ? "text-danger" : (
                    props.invertColor ? "text-back" : "text-front"
                )
            )}>
                {props.text}
            </StyledText>
        </StyledButton>
    )
}