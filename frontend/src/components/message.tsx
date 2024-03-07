import classNames from "classnames"
import { StyledButton, StyledText, StyledView } from "../styledElements"

interface Props {
    text: string
    invert: boolean
    error?: boolean
    onPress?: () => any
}

export function MyMessage(props : Props) {
    return (
        <StyledView className={classNames(
            props.invert ? "flex-row" : "flex-row-reverse",
            "flex w-full"
        )}>
            <StyledButton 
                className={classNames(
                    "py-3 px-4 max-w-xs",
                    props.invert ? 
                        "rounded-tl-3xl rounded-r-3xl bg-front": 
                        "rounded-l-3xl rounded-tr-3xl bg-back border border-front",
                    props.error ? "border-danger" : ""
                )}
                onPress={props.onPress}
                testID={`message-${props.text}`}
            >
                <StyledText className={classNames(
                    "text-sm",
                    props.invert ? "text-back" : "text-front"
                )}>
                    {props.text}
                </StyledText>
            </StyledButton>
        </StyledView>
    )
}