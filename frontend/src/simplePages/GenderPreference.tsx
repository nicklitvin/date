import { useEffect, useState } from "react"
import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { genderPreferenceText } from "../text"

interface Props {
    genders: string[]
    onSubmit: (input : string[]) => any
    submitText: string
    returnGenderCount?: (input : number) => number
}

export function GenderPreference(props : Props) {
    const [genderPreference, setGenderPreference] = useState<string[]>([]);

    useEffect( () => {
        if (props.returnGenderCount) props.returnGenderCount(genderPreference.length);
    }, [genderPreference])

    return <MySimplePage
        title={genderPreferenceText.pageTitle}
        subtitle={genderPreferenceText.pageSubtitle}
        content={
            <>
                {props.genders.map( (val) => 
                    <MyButton
                        key={`gender-pref-${val}`}
                        text={val}
                        onPressFunction={() => {
                            const index = genderPreference.findIndex( 
                                selected => selected == val
                            )
                            if (index > -1) {
                                setGenderPreference(
                                    genderPreference.splice(index,1)
                                )
                            } else {
                                setGenderPreference(
                                    [...genderPreference, val]
                                )
                            }
                        }}
                    />
                )}
                <MyButton
                    text={props.submitText}
                    onPressFunction={() => {
                        if (genderPreference.length > 0) {
                            props.onSubmit(genderPreference)
                        }
                    }}
                />
            </>
        }
    />
}