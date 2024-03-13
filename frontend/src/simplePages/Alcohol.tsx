import { useState } from "react";
import { MySimplePage } from "../components/SimplePage";
import { alcoholText, generalText } from "../text";
import { globals } from "../globals";
import { MyButton } from "../components/Button";
import { StyledView } from "../styledElements";
import { Spacing } from "../components/Spacing";

interface Props {
    onSubmit: (input : string) => any
}

export function Alcohol(props : Props) {    
    const [frequency, setFrequency] = useState<string>("");

    return (
        <MySimplePage
            title={alcoholText.pageTitle}
            subtitle={alcoholText.pageSubtitle}
            beforeGapContent={
                <>
                {globals.frequencies.map( freq => (
                    <StyledView key={`alcohol-${freq}`} className="w-full items-center flex">
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
                        if (frequency.length > 0) props.onSubmit(frequency)
                    }}
                    text={generalText.continue}
                />
            }
        />
    )
}