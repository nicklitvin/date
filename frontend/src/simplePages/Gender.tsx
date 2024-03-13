import { useState } from "react";
import { MySimplePage } from "../components/SimplePage";
import { genderText } from "../text";
import { MyButton } from "../components/Button";
import { StyledView } from "../styledElements";
import { Spacing } from "../components/Spacing";

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
        beforeGapContent={
            <>
            {props.genders.map( (val) => 
                <StyledView className="flex items-center w-full" key={`gender-${val}`}>
                    <MyButton
                        text={val}
                        onPressFunction={() => {
                            gender == val ? setGender(null) : setGender(val);
                        }}
                        invertColor={val == gender}
                    />
                    <Spacing size="md"/>
                </StyledView>
            )}
            </>
        }
        content={
            <>
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