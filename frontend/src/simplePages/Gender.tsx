import { useState } from "react";
import { MySimplePage } from "../components/SimplePage";
import { genderText } from "../text";
import { MyButton } from "../components/Button";

interface Props {
    submitText: string
    genders: string[]
    onSubmit: (input : string) => any
}

export function Gender(props : Props) {
    const [gender, setGender] = useState<string|null>(null);

    return <MySimplePage
        title={genderText.pageTitle}
        subtitle={genderText.pageSubtitle}
        content={
            <>
                {props.genders.map( (val) => 
                    <MyButton
                        key={`gender-${val}`}
                        text={val}
                        onPressFunction={() => {
                            gender == val ? setGender(null) : setGender(val);
                        }}
                    />
                )}
                <MyButton
                    text={props.submitText}
                    onPressFunction={() => {
                        if (gender) {
                            props.onSubmit(gender)
                        }
                    }}
                />
            </>
        }
    />
}