import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { genderPreferenceText } from "../text"
import { StyledView } from "../styledElements"
import classNames from "classnames"

interface Props {
    genders: string[]
    genderState: string[]
    setGenders: Function

    onSubmit?: (input : string[]) => any
    submitText?: string
    embed?: boolean
    smallButtons?: boolean
    goBack?: () => any
}

export function GenderPreference(props : Props) {
    const genderPreference = props.genderState;
    const setGenderPreference = props.setGenders;

    const pressGender = (val : string) => {
        const index = genderPreference.findIndex( 
            selected => selected == val
        )
        let copy = [...genderPreference];
        if (index > -1) {
            copy.splice(index,1);
        } else {
            copy.push(val);
        }

        setGenderPreference(copy);
    }

    const makeContent = () => (
        <StyledView 
            className={classNames(
                props.embed ? "flex flex-row" : "w-full items-center flex"
            )}
        >
            {props.genders.map( val => 
                <MyButton
                    key={`gender-pref-${val}`}
                    smallButton={props.smallButtons}
                    text={val}
                    invertColor={genderPreference.includes(val)}
                    onPressFunction={() => pressGender(val)}
                />
            )}

        </StyledView>
    )

    if (props.embed) {
        return makeContent();
    }

    return <MySimplePage
        title={genderPreferenceText.pageTitle}
        subtitle={genderPreferenceText.pageSubtitle}
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