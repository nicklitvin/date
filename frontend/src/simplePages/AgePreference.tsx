import { useState } from "react"
import { MySimplePage } from "../components/SimplePage"
import { agePreferenceText } from "../text"
import Slider from "@react-native-community/slider"
import { StyledText } from "../styledElements"
import classNames from "classnames"
import { MyButton } from "../components/Button"
import { testIDS } from "../testIDs"

interface Props {
    minAge: number
    maxAge: number
    onSubmit: (input : [number, number]) => any
    submitText: string
    embed?: boolean
    setMinAge?: Function
    setMaxAge?: Function
}

export function AgePreference(props : Props) {
    const [minAge, setMinAge] = useState<number>(props.minAge);
    const [maxAge, setMaxAge] = useState<number>(props.maxAge);

    const makeContent = () => (
        <>
            <Slider
                value={minAge}
                onValueChange={(value) => {
                    setMinAge(value);
                    if (props.setMinAge) props.setMinAge(value)
                }}
            />
            <Slider
                value={maxAge}
                onValueChange={(value) => {
                    setMaxAge(value);
                    if (props.setMaxAge) props.setMaxAge(value);
                }}
            />
            <StyledText className={classNames(
                minAge > maxAge ? "block" : "hidden"
            )}
            >
                {agePreferenceText.inputError}
            </StyledText>
        </>
    )

    if (props.embed) {
        return makeContent();
    }

    return <MySimplePage
        title={agePreferenceText.pageTitle}
        subtitle={agePreferenceText.pageSubtitle}
        content={
            <>
                {makeContent()}
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