import classNames from "classnames";
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { styles } from "../styles";

interface Props {
    text: string
    onPressFunction: () => any,
    invertColor?: boolean 
    danger?: boolean
    customButtonClass?: string
    customTextClass?: string
}

export function MyButton(props : Props) {
    return (
        <StyledButton
            onPress={props.onPressFunction}
            className={classNames(
                props.customButtonClass ?? styles.bigButton,
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
                props.customTextClass ?? styles.bigButtonText, 
                props.danger ? "text-danger" : (
                    props.invertColor ? "text-back" : "text-front"
                )
            )}>
                {props.text}
            </StyledText>
        </StyledButton>
    )
}