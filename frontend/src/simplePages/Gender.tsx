import { useState } from "react";
import { MySimplePage } from "../components/SimplePage";
import { genderText } from "../text";
import { MyButton } from "../components/Button";
import { StyledView } from "../styledElements";
import { Spacing } from "../components/Spacing";
import { showToast } from "../components/Toast";

interface Props {
    submitText: string
    genders: string[]
    onSubmit: (input : string) => any
    goBack?: () => any
    input?: string
}

export function Gender(props : Props) {
    const [gender, setGender] = useState<string|undefined>(props.input);

    const submit = () => {
        if (gender && props.onSubmit) return props.onSubmit(gender);
        else return showToast("Error", genderText.error);  
    }

    return <MySimplePage
        title={genderText.pageTitle}
        subtitle={genderText.pageSubtitle}
        goBackFunc={props.goBack}
        beforeGapContent={
            <>
            {props.genders.map( (val) => 
                <StyledView className="flex items-center w-full" key={`gender-${val}`}>
                    <MyButton
                        text={val}
                        onPressFunction={() => {
                            gender == val ? setGender(undefined) : setGender(val);
                        }}
                        invertColor={val == gender}
                    />
                    <Spacing size="md"/>
                </StyledView>
            )}
            </>
        }
        content={
            <MyButton
                text={props.submitText}
                onPressFunction={submit}
            />
        }
    />
}