import { useEffect, useState } from "react"
import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { genderPreferenceText } from "../text"
import { StyledView } from "../styledElements"
import classNames from "classnames"

interface Props {
    genders: string[]
    selectedGenders?: string[]
    onSubmit?: (input : string[]) => any
    submitText?: string
    returnGenderCount?: (input : number) => number
    embed?: boolean
    setGenders?: Function
    smallButtons?: boolean
}

export function GenderPreference(props : Props) {
    const [genderPreference, setGenderPreference] = useState<string[]>(props.selectedGenders ?? []);

    useEffect( () => {
        if (props.returnGenderCount) props.returnGenderCount(genderPreference.length);
    }, [genderPreference])

    const makeContent = () => (
        <>
        {props.genders.map( (val) => 
            <StyledView 
                key={`gender-pref-${val}`} 
                className={classNames(
                    props.embed ? "flex flex-row" : "w-full items-center flex mb-3"
                )}
            >
                <MyButton
                    smallButton={props.smallButtons}
                    text={val}
                    invertColor={genderPreference.includes(val)}
                    onPressFunction={() => {
                        const index = genderPreference.findIndex( 
                            selected => selected == val
                        )
                        let copy = [...genderPreference];
                        if (index > -1) {
                            copy.splice(index,1);
                        } else {
                            copy.push(val);
                        }

                        if (props.setGenders) props.setGenders(copy);
                        setGenderPreference(copy);
                    }}
                />
            </StyledView>
            
        )}
        </>
    )

    if (props.embed) {
        return makeContent();
    }

    return <MySimplePage
        title={genderPreferenceText.pageTitle}
        subtitle={genderPreferenceText.pageSubtitle}
        beforeGapContent={
            <>
                {makeContent()}
            </>
        }
        content={
            <>
                <MyButton
                    text={props.submitText ?? ""}
                    onPressFunction={() => {
                        if (genderPreference.length > 0 && props.onSubmit) {
                            props.onSubmit(genderPreference)
                        }
                    }}
                />
            </>
        }
    />
}