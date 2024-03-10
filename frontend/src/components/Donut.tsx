import { PieChart } from "react-native-gifted-charts"
import { StyledText, StyledView } from "../styledElements"
import { globals } from "../globals"

interface Props {
    likes: number
    dislikes: number
    likeText: string
    dislikeText: string
}

export function MyDonut(props : Props) {
    return (
        <StyledView className="flex w-full flex-row items-center">
            <PieChart
                radius={50}
                donut
                data={[
                    {
                        value: props.likes,
                        color: globals.green   
                    },
                    {
                        value: props.dislikes,
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
                    {`Ratio: ${Math.round(props.likes/(props.likes+ props.dislikes) * 100)}%`}
                </StyledText>
            </StyledView>
        </StyledView>
    )
}