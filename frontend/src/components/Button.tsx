import { StyledButton, StyledText } from "../styledElements";

interface Props {
    text: string
    onPressFunction: () => any,
}

export function MyButton({text, onPressFunction} : Props) {
    return (
        <StyledButton onPress={onPressFunction}>
            <StyledText>
                {text}
            </StyledText>
        </StyledButton>
    )
}