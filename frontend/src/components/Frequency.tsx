import { StyledImage, StyledText, StyledView } from "../styledElements";

type Habit = "Alcohol" | "Smoking";

interface Props {
    habit: Habit
    frequency: string
}

export function Frequency(props : Props) {
    let image;
    switch (props.habit) {
        case ("Alcohol"): image = require("../../assets/Alcohol.png"); break;
        case ("Smoking"): image = require("../../assets/Smoke.png"); break;
    }

    return (
        <StyledView className="border border-front rounded-3xl py-2 px-3 flex flex-row">
            <StyledImage
                source={image}
                className="w-[25px] h-[25px]"
            />
            <StyledText className="text-base pl-1">
                {props.frequency}
            </StyledText>
        </StyledView>
    )
}