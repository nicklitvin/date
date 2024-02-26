import { observer } from "mobx-react-lite";
import { UserSwipeStats } from "../interfaces";
import { statsText } from "../text";
import { StyledText, StyledView } from "../styledElements";
import { PageHeader } from "../components/PageHeader";
import { MyButton } from "../components/Button";
import { LineChart, PieChart, PieChartData, ChartProps } from "react-native-svg-charts";
import { globals } from "../globals";
import axios from "axios";
import { URLs } from "../urls";
import { Linking } from "react-native";

interface Props {
    stats?: UserSwipeStats
    openLinkFunc?: (url : string) => any
}

export function Stats(props : Props) {
    const getCheckoutPage = async () => {
        try {
            const response = await axios.post(URLs.server + URLs.getCheckoutPage);
            const url = response.data;
            if (props.openLinkFunc) {
                props.openLinkFunc(url);
            } else {
                await Linking.openURL(url);
            }
        } catch (err) {}
    }
    
    let content;
    if (!props.stats) {
        content = (
            <StyledView>
                <StyledText>
                    {statsText.purchaseText}
                </StyledText>
                <MyButton
                    text={statsText.purchaseButton}
                    onPressFunction={getCheckoutPage}
                />
            </StyledView>
        ) 
    } else {
        const receivedDataAllTime : PieChartData[] = [
            {
                key: `like-me-alltime`,
                value: props.stats.allTime.likedMe,
                svg: {
                    fill: globals.green
                }
            }, 
            {
                key: `dislike-me-alltime`,
                value: props.stats.allTime.dislikedMe,
                svg: {
                    fill: globals.red
                }
            }
        ];

        const sentDataAllTime : PieChartData[] = [
            {
                key: `my-like-alltime`,
                value: props.stats.allTime.myLikes,
                svg: {
                    fill: globals.green
                }
            }, 
            {
                key: `my-dislike-alltime`,
                value: props.stats.allTime.myDislikes,
                svg: {
                    fill: globals.red
                }
            }
        ];
        const receivedWeekly = [
            {
                data: props.stats.weekly.reverse().map(val => val.likedMe),
                svg: {stroke : globals.green}
            },
            {
                data: props.stats.weekly.reverse().map(val => val.dislikedMe),
                svg: {stroke : globals.red}
            }
        ]
        const sentWeekly = [
            {
                data: props.stats.weekly.reverse().map(val => val.myLikes),
                svg: {stroke : globals.green}
            },
            {
                data: props.stats.weekly.reverse().map(val => val.myDislikes),
                svg: {stroke : globals.red}
            }
        ]

        const allTimeReceived = (
            <StyledView>
                <PieChart
                    data={receivedDataAllTime}
                />
                <StyledView>
                    <StyledText>{`${props.stats.allTime.likedMe} Likes Received`}</StyledText>
                    <StyledText>{`${props.stats.allTime.dislikedMe} Dislikes Received`}</StyledText>
                    <StyledText>{`Ratio: ${Math.round(props.stats.allTime.likedMe/props.stats.allTime.dislikedMe)}%`}</StyledText>
                </StyledView>
            </StyledView>
        )

        const allTimeSent = (
            <StyledView>
                <PieChart
                    data={sentDataAllTime}
                />
                <StyledView>
                    <StyledText>{`${props.stats.allTime.myLikes} Likes Sent`}</StyledText>
                    <StyledText>{`${props.stats.allTime.myDislikes} Dislikes Sent`}</StyledText>
                    <StyledText>{`Ratio: ${Math.round(props.stats.allTime.myLikes/props.stats.allTime.myDislikes)}%`}</StyledText>
                </StyledView>
            </StyledView>
        )

        const weeklyReceived = (
            <StyledView>
                <LineChart
                    data={receivedWeekly}
                />
            </StyledView>
        )

        const weeklySent = (
            <StyledView>
                <LineChart
                    data={sentWeekly}
                />
            </StyledView>
        )

        content = (
            <StyledView>
                <StyledText>
                    {statsText.allTime}
                </StyledText>
                {allTimeReceived}
                {allTimeSent}
                <StyledText>
                    {statsText.weeklyReceived}
                </StyledText>
                {weeklyReceived}
                <StyledText>
                    {statsText.weeklySent}
                </StyledText>
                {weeklySent}
            </StyledView>
        )
    }

    return (
        <StyledView>
            <PageHeader
                title={statsText.pageTitle}
                imageSource=""
            />
            {content}
        </StyledView>
    )
}

export const StatsMob = observer(Stats);