import { observer } from "mobx-react-lite";
import { UserSwipeStats } from "../interfaces";
import { statsText } from "../text";
import { StyledScroll, StyledText, StyledView } from "../styledElements";
import { PageHeader } from "../components/PageHeader";
import { MyButton } from "../components/Button";
import axios from "axios";
import { URLs } from "../urls";
import { Linking } from "react-native";
import { createTimeoutSignal } from "../utils";
import { MyDonut } from "../components/Donut";
import { Weekly } from "../components/Weekly";
import { Spacing } from "../components/Spacing";

interface Props {
    stats?: UserSwipeStats
    openLinkFunc?: (url : string) => any
}

export function Stats(props : Props) {
    const getCheckoutPage = async () => {
        try {
            const response = await axios.post(URLs.server + URLs.getCheckoutPage, null, {
                signal: createTimeoutSignal()
            });
            const url = response.data;
            if (props.openLinkFunc) {
                props.openLinkFunc(url);
            } else {
                await Linking.openURL(url);
            }
        } catch (err) {
            console.log(err)
        }
    }
    
    let content;

    if (!props.stats) {
        content = (
            <StyledView className="flex flex-col items-center w-full pt-[200px]">
                {statsText.purchaseText.map( val => (
                    <StyledText 
                        key={`stat-text-${val}`}
                        className="text-center px-10 text-xl"
                    >
                        {val}
                    </StyledText>
                ))}
                <StyledView className="w-full pt-3 items-center flex">
                    <MyButton
                        text={statsText.purchaseButton}
                        onPressFunction={getCheckoutPage}
                    />
                </StyledView>
            </StyledView>
        ) 
    } else {
        content = (
            <>
                <StyledView className="px-5">
                    <StyledText className="font-bold text-xl">
                        {statsText.allTimeReceived}
                    </StyledText>
                    <Spacing size="lg"/>
                    <MyDonut
                        likes={props.stats.allTime.likedMe}
                        dislikes={props.stats.allTime.dislikedMe}
                        likeText={statsText.likesReceived}
                        dislikeText={statsText.dislikesReceived}
                    />
                    <Spacing size="lg"/>
                    <StyledText className="font-bold text-xl">
                        {statsText.allTimeSent}
                    </StyledText>
                    <Spacing size="lg"/>
                    <MyDonut
                        likes={props.stats.allTime.myLikes}
                        dislikes={props.stats.allTime.myDislikes}
                        likeText={statsText.likesSent}
                        dislikeText={statsText.dislikesSent}
                    />
                    <Spacing size="lg"/>
                    <StyledText className="font-bold text-xl">
                        {statsText.weeklyReceived}
                    </StyledText>
                    <Weekly
                        likes={props.stats.weekly.map( val => val.likedMe)}
                        dislikes={props.stats.weekly.map( val => val.dislikedMe)}
                        likeText={statsText.likesReceived}
                        dislikeText={statsText.dislikesReceived}
                    />
                    <Spacing size="lg"/>
                    <StyledText className="font-bold text-xl">
                        {statsText.weeklySent}
                    </StyledText>
                    <Weekly
                        likes={props.stats.weekly.map( val => val.myLikes)}
                        dislikes={props.stats.weekly.map( val => val.myDislikes)}
                        likeText={statsText.likesSent}
                        dislikeText={statsText.dislikesSent}
                    />
                </StyledView>
                <Spacing size="lg"/>
            </>
        )
    }

    return (
        <StyledView>
            <StyledScroll>
                <PageHeader
                    title={statsText.pageTitle}
                    imageType="Stats"
                />
                {content}
            </StyledScroll>
        </StyledView>
    )
    // const data = [1,40,3,4];
    // const data2 = [4,1,15,1];

    // return (
    //     <>
    //         <LineChart
    //             data={data.map(val => ({
    //                 value: val,
    //                 dataPointColor: globals.red,
    //             }))}
    //             data2={data2.map(val => ({
    //                 value: val,
    //                 dataPointColor: globals.green
    //             }))}
    //             color1={globals.red}
    //             color2={globals.green}
    //             hideAxesAndRules={true}
    //             thickness={5}
    //             dataPointsRadius={10}
    //         />
    //         <PieChart
    //             data={[
    //                 {
    //                     value: 10,
    //                     color: globals.green
    //                 },
    //                 {
    //                     value: 10,
    //                     color: globals.red
    //                 }
    //             ]}
    //         />
    //     </>
    // )
    // } else {
    //     const receivedDataAllTime : PieChartData[] = [
    //         {
    //             key: `like-me-alltime`,
    //             value: props.stats.allTime.likedMe,
    //             svg: {
    //                 fill: globals.green
    //             }
    //         }, 
    //         {
    //             key: `dislike-me-alltime`,
    //             value: props.stats.allTime.dislikedMe,
    //             svg: {
    //                 fill: globals.red
    //             }
    //         }
    //     ];

    //     const sentDataAllTime : PieChartData[] = [
    //         {
    //             key: `my-like-alltime`,
    //             value: props.stats.allTime.myLikes,
    //             svg: {
    //                 fill: globals.green
    //             }
    //         }, 
    //         {
    //             key: `my-dislike-alltime`,
    //             value: props.stats.allTime.myDislikes,
    //             svg: {
    //                 fill: globals.red
    //             }
    //         }
    //     ];
    //     const receivedWeekly = [
    //         {
    //             data: props.stats.weekly.reverse().map(val => val.likedMe),
    //             svg: {stroke : globals.green}
    //         },
    //         {
    //             data: props.stats.weekly.reverse().map(val => val.dislikedMe),
    //             svg: {stroke : globals.red}
    //         }
    //     ]
    //     const sentWeekly = [
    //         {
    //             data: props.stats.weekly.reverse().map(val => val.myLikes),
    //             svg: {stroke : globals.green}
    //         },
    //         {
    //             data: props.stats.weekly.reverse().map(val => val.myDislikes),
    //             svg: {stroke : globals.red}
    //         }
    //     ]

    //     const allTimeReceived = (
    //         <StyledView>
    //             <PieChart
    //                 data={receivedDataAllTime}
    //                 width={100}
    //                 height={100}
    //                 style={{backgroundColor: "red"}}
    //             />
    //             <StyledView>
    //                 <StyledText>{`${props.stats.allTime.likedMe} Likes Received`}</StyledText>
    //                 <StyledText>{`${props.stats.allTime.dislikedMe} Dislikes Received`}</StyledText>
    //                 <StyledText>{`Ratio: ${Math.round(props.stats.allTime.likedMe/props.stats.allTime.dislikedMe)}%`}</StyledText>
    //             </StyledView>
    //         </StyledView>
    //     )

    //     const allTimeSent = (
    //         <StyledView>
    //             <PieChart
    //                 data={sentDataAllTime}
    //             />
    //             <StyledView>
    //                 <StyledText>{`${props.stats.allTime.myLikes} Likes Sent`}</StyledText>
    //                 <StyledText>{`${props.stats.allTime.myDislikes} Dislikes Sent`}</StyledText>
    //                 <StyledText>{`Ratio: ${Math.round(props.stats.allTime.myLikes/props.stats.allTime.myDislikes)}%`}</StyledText>
    //             </StyledView>
    //         </StyledView>
    //     )

    //     const weeklyReceived = (
    //         <StyledView>
    //             <LineChart
    //                 data={receivedWeekly}
    //             />
    //         </StyledView>
    //     )

    //     const weeklySent = (
    //         <StyledView>
    //             <LineChart
    //                 data={sentWeekly}
    //             />
    //         </StyledView>
    //     )


    //     content = (    
    //         <StyledView className="px-5">
    //             <StyledText className="font-bold text-xl">
    //                 {statsText.allTime}
    //             </StyledText>
    //             {allTimeReceived}
    //             {allTimeSent}
    //             <StyledText className="font-bold text-xl">
    //                 {statsText.weeklyReceived}
    //             </StyledText>
    //             {weeklyReceived}
    //             <StyledText className="font-bold text-xl">
    //                 {statsText.weeklySent}
    //             </StyledText>
    //             {weeklySent}
    //         </StyledView>
    //     )
    // }
}

export const StatsMob = observer(Stats);