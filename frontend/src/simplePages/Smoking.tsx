import { useState } from "react";
import { MySimplePage } from "../components/SimplePage";
import { generalText, smokingText } from "../text";
import { globals } from "../globals";
import { MyButton } from "../components/Button";
import { StyledView } from "../styledElements";
import { Spacing } from "../components/Spacing";

interface Props {
    onSubmit: (input : string) => any
    goBack?: () => any
    input?: string
}

export function Smoking(props : Props) {    
    const [frequency, setFrequency] = useState<string|undefined>(props.input);

    return (
        <MySimplePage
            title={smokingText.pageTitle}
            subtitle={smokingText.pageSubtitle}
            goBackFunc={props.goBack}
            beforeGapContent={
                <>
                {globals.frequencies.map( freq => (
                    <StyledView key={`smoking-${freq}`} className="w-full items-center flex">
                        <MyButton
                            text={freq}
                            onPressFunction={() => frequency == freq ? setFrequency("") : setFrequency(freq)}
                            invertColor={frequency == freq}
                        />
                        <Spacing size="md"/>
                    </StyledView>
                ))}
                </>
            }
            content={
                <MyButton
                    onPressFunction={() => {
                        if (frequency) props.onSubmit(frequency)
                    }}
                    text={generalText.continue}
                />
            }
        />
    )
}