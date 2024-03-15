import { observer } from "mobx-react-lite";
import { UserSwipeStats } from "../../src/interfaces";
import { statsText } from "../../src/text";
import { StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { PageHeader } from "../../src/components/PageHeader";
import { MyButton } from "../../src/components/Button";
import axios from "axios";
import { URLs } from "../../src/urls";
import { Linking } from "react-native";
import { createTimeoutSignal } from "../../src/utils";
import { MyDonut } from "../../src/components/Donut";
import { Weekly } from "../../src/components/Weekly";
import { Spacing } from "../../src/components/Spacing";
import { useStore } from "../../src/store/RootStore";

export function Stats() {
    const { receivedData } = useStore();    
    const stats = receivedData.stats;

    const getCheckoutPage = async () => {
        try {
            const response = await axios.post(URLs.server + URLs.getCheckoutPage, null, {
                signal: createTimeoutSignal()
            });
            const url = response.data;
            await Linking.openURL(url);
        } catch (err) {
            console.log(err)
        }
    }
    
    let content;

    if (!stats) {
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
                        likes={stats.allTime.likedMe}
                        dislikes={stats.allTime.dislikedMe}
                        likeText={statsText.likesReceived}
                        dislikeText={statsText.dislikesReceived}
                    />
                    <Spacing size="lg"/>
                    <StyledText className="font-bold text-xl">
                        {statsText.allTimeSent}
                    </StyledText>
                    <Spacing size="lg"/>
                    <MyDonut
                        likes={stats.allTime.myLikes}
                        dislikes={stats.allTime.myDislikes}
                        likeText={statsText.likesSent}
                        dislikeText={statsText.dislikesSent}
                    />
                    <Spacing size="lg"/>
                    <StyledText className="font-bold text-xl">
                        {statsText.weeklyReceived}
                    </StyledText>
                    <Weekly
                        likes={stats.weekly.map( val => val.likedMe)}
                        dislikes={stats.weekly.map( val => val.dislikedMe)}
                        likeText={statsText.likesReceived}
                        dislikeText={statsText.dislikesReceived}
                    />
                    <Spacing size="lg"/>
                    <StyledText className="font-bold text-xl">
                        {statsText.weeklySent}
                    </StyledText>
                    <Weekly
                        likes={stats.weekly.map( val => val.myLikes)}
                        dislikes={stats.weekly.map( val => val.myDislikes)}
                        likeText={statsText.likesSent}
                        dislikeText={statsText.dislikesSent}
                    />
                </StyledView>
                <Spacing size="lg"/>
            </>
        )
    }

    return (
        <StyledView className="w-full h-full bg-back">
            <StyledScroll>
                <PageHeader
                    title={statsText.pageTitle}
                    imageType="Stats"
                />
                {content}
            </StyledScroll>
        </StyledView>
    )
}

export const StatsMob = observer(Stats);
export default StatsMob;