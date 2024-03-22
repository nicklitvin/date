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
    ages: [number, number]
    setAges: Function

    onSubmit?: (input : [number, number]) => any
    submitText?: string
    embed?: boolean
    goBack?: () => any
}

export function AgePreference(props : Props) {
    const updateAges = (min : number, max : number) => {
        props.setAges([min,max])
    }

    const makeContent = () => (
        <StyledView className="flex w-full items-center">
            <StyledText className="text-lg mb-3">
                {`Min Age: ${props.ages[0]}`}
            </StyledText>
            <StyledSlider
                minimumTrackTintColor={globals.dark}
                thumbTintColor={globals.dark}
                upperLimit={props.ages[1]}
                className="w-full h-10 mb-3"
                minimumValue={globals.minAge}
                maximumValue={globals.maxAge}
                step={1}
                value={props.ages[0]}
                onValueChange={(value) => updateAges(value,props.ages[1])
            }
            />
            <StyledText className="text-lg mb-3">
                {`Max Age: ${props.ages[1]}`}
            </StyledText>
            <StyledSlider
                className="w-full mb-3"
                minimumTrackTintColor={globals.dark}
                thumbTintColor={globals.dark}
                minimumValue={globals.minAge}
                maximumValue={globals.maxAge}
                lowerLimit={props.ages[0]}
                step={1}
                value={props.ages[1]}
                onValueChange={(value) => updateAges(props.ages[0],value)}
            />
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
                        if (props.onSubmit)
                            props.onSubmit([props.ages[0],props.ages[1]])
                        }
                    }
                />
            </>
        }
    />
}