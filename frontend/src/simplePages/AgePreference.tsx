import { useState } from "react"
import { MySimplePage } from "../components/SimplePage"
import { agePreferenceText } from "../text"
import Slider from "@react-native-community/slider"
import { StyledSlider, StyledText, StyledView } from "../styledElements"
import classNames from "classnames"
import { MyButton } from "../components/Button"
import { testIDS } from "../testIDs"
import { globals } from "../globals"

interface Props {
    minAge: number
    maxAge: number
    onSubmit?: (input : [number, number]) => any
    submitText?: string
    embed?: boolean
    setMinAge?: Function
    setMaxAge?: Function
    goBack?: () => any
}

export function AgePreference(props : Props) {
    const [minAge, setMinAge] = useState<number>(props.minAge);
    const [maxAge, setMaxAge] = useState<number>(props.maxAge);

    const makeContent = () => (
        <StyledView className="flex w-full items-center">
            <StyledText className="text-lg mb-3">
                {`Min Age: ${minAge}`}
            </StyledText>
            <StyledSlider
                minimumTrackTintColor={globals.dark}
                thumbTintColor={globals.dark}
                upperLimit={maxAge}
                className="w-full h-10 mb-3"
                minimumValue={globals.minAge}
                maximumValue={globals.maxAge}
                step={1}
                value={minAge}
                onValueChange={(value) => {
                    setMinAge(value);
                    if (props.setMinAge) props.setMinAge(value)
                }}
            />
            <StyledText className="text-lg mb-3">
                {`Max Age: ${maxAge}`}
            </StyledText>
            <StyledSlider
                className="w-full mb-3"
                minimumTrackTintColor={globals.dark}
                thumbTintColor={globals.dark}
                minimumValue={globals.minAge}
                maximumValue={globals.maxAge}
                lowerLimit={minAge}
                step={1}
                value={maxAge}
                onValueChange={(value) => {
                    setMaxAge(value);
                    if (props.setMaxAge) props.setMaxAge(value);
                }}
            />
            <StyledText className={classNames(
                "mb-3",
                minAge > maxAge ? "opacity-1" : "opacity-0"
            )}
            >
                {agePreferenceText.inputError}
            </StyledText>
        </StyledView>
    )

    if (props.embed) {
        return makeContent();
    }

    return <MySimplePage
        title={agePreferenceText.pageTitle}
        subtitle={agePreferenceText.pageSubtitle}
        goBackFunc={props.goBack}
        beforeGapContent={
            <>
                {makeContent()}
            </>
        }
        content={
            <>
                <MyButton
                    text={props.submitText ?? ""}
                    onPressFunction={ () => {
                        if (minAge <= maxAge && props.onSubmit) {
                            props.onSubmit([minAge,maxAge])
                        }
                    }}
                />
            </>
        }
    />
}