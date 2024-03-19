import classNames from "classnames";
import { StyledButton, StyledText } from "../styledElements";

interface Props {
    text: string
    onPressFunction: () => any,
    invertColor?: boolean 
    danger?: boolean
    smallButton?: boolean
    saveChange?: boolean
    fullSize?: boolean
    disable?: boolean
}

export function MyButton(props : Props) {
    return (
        <StyledButton
            disabled={props.disable}
            onPress={props.onPressFunction}
            className={classNames(
                "border border-front",
                props.smallButton ? "m-1 rounded-3xl" : ( props.fullSize ? 
                    "w-full rounded-xl p-3" :
                    "w-3/5 rounded-[50px] px-10 py-3"
                ),
                props.invertColor ? "bg-front" : "bg-back",
            )}
            style={{
                // IOS
                shadowColor: 'rgba(0,0,0, .4)', 
                shadowOffset: { height: 1, width: 1 }, 
                shadowOpacity: 1, 
                shadowRadius: 1, 
                // Android
                elevation: 5
            }}
        >
            <StyledText className={classNames(
                props.smallButton ? "px-4 py-1 text-base text-center" : (
                    props.fullSize ? 
                    "text-start text-lg" :
                    "text-center text-lg font-bold"
                ),
                props.danger ? "text-danger" : (
                    props.invertColor ? "text-back" : "text-front"
                ),
                props.saveChange ? "w-[150px]" : ""
            )}>
                {props.text}
            </StyledText>
        </StyledButton>
    )
}