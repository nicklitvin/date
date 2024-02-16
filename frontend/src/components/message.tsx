import classNames from "classnames"
import { StyledText, StyledView } from "../styledElements"

interface Props {
    text: string
    invert: boolean
}

export function MyMessage(props : Props) {
    return (
        <StyledView>
            <StyledView className={classNames(
                
            )}>
                <StyledText className={classNames(
                    
                )}>
                    {props.text}
                </StyledText>
            </StyledView>
        </StyledView>
    )
}