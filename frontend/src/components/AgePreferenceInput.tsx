import Slider from "@react-native-community/slider"
import { StyledText } from "../styledElements";
import classNames from "classnames";
import { myText } from "../text";

interface Props {
    minAge: number
    maxAge: number

    setMinAge: React.Dispatch<React.SetStateAction<number>>
    setMaxAge: React.Dispatch<React.SetStateAction<number>>
}

export function AgePreferenceInput(props : Props) {
    return (
        <>
            <Slider
                value={props.minAge}
                onValueChange={(value) => props.setMinAge(value)}
            />
            <Slider
                value={props.minAge}
                onValueChange={(value) => props.setMinAge(value)}
            />
            <StyledText className={classNames(
                props.minAge > props.maxAge ? "block" : "hidden"
            )}
            >
                {myText.agePreferenceInputError}
            </StyledText>
        </>
    )
}