import { PieChart } from "react-native-gifted-charts"
import { StyledText, StyledView } from "../styledElements"
import { globals } from "../globals"
import { statsText } from "../text"

interface Props {
    likes: number
    dislikes: number
    likeText: string
    dislikeText: string
}

export function MyDonut(props : Props) {
    const isEmpty = props.likes + props.dislikes == 0;

    return (
        <StyledView className="flex w-full flex-row items-center">
            <PieChart
                radius={50}
                donut
                data={[
                    {
                        value: isEmpty ? 1 : props.likes,
                        color: globals.green   
                    },
                    {
                        value: isEmpty ? 1 : props.dislikes,
                        color: globals.red
                    }
                ]}
            />
            <StyledView className="flex flex-col pl-10">
                <StyledText className="text-base">
                    {`${props.likes} ${props.likeText}`}
                </StyledText>
                <StyledText className="text-base">
                    {`${props.dislikes} ${props.dislikeText}`}
                </StyledText>
                <StyledText className="text-base">
                    {
                        isEmpty ?
                        statsText.noRatio :
                        `Ratio: ${Math.round(props.likes/(props.likes + props.dislikes) * 100)}%`
                    }
                </StyledText>
            </StyledView>
        </StyledView>
    )
}