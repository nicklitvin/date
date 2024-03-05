import { useEffect, useState } from "react"
import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { genderPreferenceText } from "../text"
import { StyledView } from "../styledElements"
import classNames from "classnames"

interface Props {
    genders: string[]
    onSubmit: (input : string[]) => any
    submitText: string
    returnGenderCount?: (input : number) => number
    embed?: boolean
    setGenders?: Function
}

export function GenderPreference(props : Props) {
    const [genderPreference, setGenderPreference] = useState<string[]>([]);

    useEffect( () => {
        if (props.returnGenderCount) props.returnGenderCount(genderPreference.length);
    }, [genderPreference])

    const makeContent = () => (
        <>
        {props.genders.map( (val) => 
            <StyledView 
                key={`gender-pref-${val}`} 
                className={classNames(
                    props.embed ? "" : "w-full items-center flex mb-3"
                )}
            >
                <MyButton
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
        content={
            <>
                {makeContent()}
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