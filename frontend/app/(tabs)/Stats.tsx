import { observer } from "mobx-react-lite";
import { JustUserID, UserSwipeStats, WithKey } from "../../src/interfaces";
import { statsText } from "../../src/text";
import { StyledButton, StyledScroll, StyledText, StyledView } from "../../src/styledElements";
import { PageHeader } from "../../src/components/PageHeader";
import { MyButton } from "../../src/components/Button";
import { URLs } from "../../src/urls";
import { Linking } from "react-native";
import { sendRequest } from "../../src/utils";
import { Spacing } from "../../src/components/Spacing";
import { useStore } from "../../src/store/RootStore";
import { testIDS } from "../../src/testIDs";
import { useEffect, useState } from "react";
// import { MyDonut } from "../../src/components/Donut";
// import { Weekly } from "../../src/components/Weekly";

interface Props {
    noAutoLoad?: boolean
    openLinkFunc?: (input : string) => any
    dontLoadCharts?: boolean
}

export function Stats(props : Props) {
    const { receivedData } = useStore();    
    const [stats, setStats] = useState<UserSwipeStats|null>(receivedData.stats);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    // let MyDonut;
    // let Weekly;
    // if (!props.dontLoadCharts) {
    //     MyDonut = require("../../src/components/Donut");
    //     Weekly = require("../../src/components/Weekly");
    // }

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (props.noAutoLoad) return
            load();
        }
    }, [firstLoad])

    useEffect( () => {
        if (stats && !receivedData.stats) {
            receivedData.setStats(stats);
        }
    }, [stats])

    const load = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            const response = await sendRequest<UserSwipeStats>(URLs.getStats, input);
            if (response.message) {
                // toast
            } else if (response.data) {
                setStats(response.data);
            }
        } catch (err) {

        }
    }

    const getCheckoutPage = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            const response = await sendRequest<string>(URLs.getCheckoutPage, input);
            if (response.message) {
                // toast
            } else if (response.data) {
                if (props.openLinkFunc) props.openLinkFunc(response.data) 
                else await Linking.openURL(response.data);
            }
            
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
    } else if (props.dontLoadCharts) {
        content = <></>
    } else {
        content = (
            <>
                <StyledView className="px-5">
                    {/* <StyledText className="font-bold text-xl">
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
                    /> */}
                </StyledView>
                <Spacing size="lg"/>
            </>
        )
    }

    return (
        <StyledView className="w-full h-full bg-back">
            <StyledButton testID={testIDS.load} onPress={load}/>
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