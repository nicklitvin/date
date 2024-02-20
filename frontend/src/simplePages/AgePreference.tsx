import { useState } from "react"
import { MySimplePage } from "../components/SimplePage"
import { agePreferenceText } from "../text"
import Slider from "@react-native-community/slider"
import { StyledText } from "../styledElements"
import classNames from "classnames"
import { MyButton } from "../components/Button"

interface Props {
    minAge: number
    maxAge: number
    onSubmit: (input : [number, number]) => any
    submitText: string
}

export function AgePreference(props : Props) {
    const [minAge, setMinAge] = useState<number>(props.minAge);
    const [maxAge, setMaxAge] = useState<number>(props.maxAge);

    return <MySimplePage
        title={agePreferenceText.pageTitle}
        subtitle={agePreferenceText.pageSubtitle}
        content={
            <>
                <Slider
                    value={props.minAge}
                    onValueChange={(value) => setMinAge(value)}
                />
                <Slider
                    value={props.maxAge}
                    onValueChange={(value) => setMaxAge(value)}
                />
                <StyledText className={classNames(
                    props.minAge > props.maxAge ? "block" : "hidden"
                )}
                >
                    {agePreferenceText.inputError}
                </StyledText>
                <MyButton
                    text={props.submitText}
                    onPressFunction={ () => {
                        if (minAge <= maxAge) {
                            props.onSubmit([minAge,maxAge])
                        }
                    }}
                />
            </>
        }
    />
}