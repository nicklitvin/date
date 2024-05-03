import { LineChart } from "react-native-gifted-charts"
import { StyledText, StyledView } from "../styledElements"
import { globals } from "../globals"
import { useState } from "react"
import { addDays, addWeeks, differenceInDays } from "date-fns"
import { getShortDate } from "../utils"
import { statsText } from "../text"

interface Props {
    likes: number[]
    dislikes: number[]
    likeText: string
    dislikeText: string
}

export function Weekly(props : Props) {
    const unselectedDotSize = 8;
    const selectedDotSize = 10;
    const [week, setWeek] = useState<number>(props.likes.length - 1);

    const updateWeek = (input : {index : number}) => {
        setWeek(input.index)
    }

    return (
        <StyledView className="w-full pt-5">
            <LineChart
                spacing={90}
                data={props.likes.map( (val,index) => ({
                    value: val,
                    dataPointColor: globals.green,
                    index: index,
                    dataPointRadius: week == index ? selectedDotSize : unselectedDotSize
                }))}
                data2={props.dislikes.map( (val,index) => ({
                    value: val,
                    dataPointColor: globals.red,
                    index: index,
                    dataPointRadius: week == index ? selectedDotSize : unselectedDotSize
                }))}
                color1={globals.green}
                color2={globals.red}
                thickness={5}
                dataPointsRadius={10}
                hideYAxisText
                hideRules
                xAxisThickness={3}
                yAxisThickness={3}
                onPress={updateWeek}
                
            />
            <StyledText className="text-xl">
                {`${getShortDate(addWeeks(new Date(),-(props.likes.length - week)))} - ${getShortDate(addWeeks(new Date(),-(props.likes.length - 1 - week)))}`}
            </StyledText>
            <StyledText className="text-base">
                {`${props.likes[week]} ${props.likeText}`}
            </StyledText>
            <StyledText className="text-base">
                {`${props.dislikes[week]} ${props.dislikeText}`}
            </StyledText>
            <StyledText className="text-base">
                {
                    props.likes[week] + props.dislikes[week] == 0 ?
                    statsText.noRatio : 
                    `Ratio: ${Math.round(props.likes[week]/(props.likes[week] + props.dislikes[week]) * 100)}%`
                }
            </StyledText>
        </StyledView>
    )
}