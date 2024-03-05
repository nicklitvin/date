import { useState } from "react";
import { MySimplePage } from "../components/SimplePage";
import { genderText } from "../text";
import { MyButton } from "../components/Button";
import { StyledView } from "../styledElements";

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
            <StyledView className="flex flex-col w-full">
                {props.genders.map( (val) => 
                    <StyledView className="flex items-center pb-2" key={`gender-${val}`}>
                        <MyButton
                            text={val}
                            onPressFunction={() => {
                                gender == val ? setGender(null) : setGender(val);
                            }}
                            invertColor={val == gender}
                        />
                    </StyledView>
                )}
            </StyledView>
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