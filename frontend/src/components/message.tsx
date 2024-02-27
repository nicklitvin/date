import classNames from "classnames"
import { StyledText, StyledView } from "../styledElements"

interface Props {
    text: string
    invert: boolean
}

export function MyMessage(props : Props) {
    return (
        <StyledView className={classNames(
            props.invert ? "flex-row" : "flex-row-reverse",
            "flex w-full"
        )}>
            <StyledView className={classNames(
                "py-4 px-4 max-w-xs",
                props.invert ? 
                    "rounded-tl-3xl rounded-r-3xl bg-front": 
                    "rounded-l-3xl rounded-tr-3xl bg-back border border-front",
            )}>
                <StyledText className={classNames(
                    props.invert ? "text-back" : "text-front"
                )}>
                    {props.text}
                </StyledText>
            </StyledView>
        </StyledView>
    )
}