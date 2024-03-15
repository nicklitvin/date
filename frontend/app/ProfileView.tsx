import { observer } from "mobx-react-lite";
import { StyledScroll, StyledText, StyledView } from "../src/styledElements";
import { PageHeader } from "../src/components/PageHeader";
import { profileViewText } from "../src/text";
import { PublicProfile, RequestReportInput, SwipeInput } from "../src/interfaces";
import { PictureSeries } from "../src/components/PictureSeries";
import { Spacing } from "../src/components/Spacing";
import { MyButton } from "../src/components/Button";
import { Frequency } from "../src/components/Frequency";
import { useStore } from "../src/store/RootStore";
import { Redirect, router, useLocalSearchParams } from "expo-router";

export function ProfileView() {
    const { receivedData } = useStore();
    const { userID } = useLocalSearchParams();

    let profile : PublicProfile|undefined;

    if (receivedData.profile && receivedData.profile.id == userID) {
        profile = receivedData.profile;
    } else {
        const index = receivedData.chatPreviews?.findIndex(val =>
            val.profile.id == userID
        );
        if (index) profile = receivedData.chatPreviews![index].profile;
    }

    if (!profile) return <Redirect href="Error"/>

    return (
        <StyledScroll showsVerticalScrollIndicator={false}>
        <StyledView className="w-full h-full bg-back">
            <PageHeader
                title={profileViewText.pageTitle}
                imageType="Telescope"
            />
            <PictureSeries
                imageURLs={profile.images}
            />
            <Spacing size="lg"/>
            <StyledView className="px-5">
                <StyledText className="font-bold text-3xl">
                    {`${profile.name}, ${profile.age}`}
                </StyledText>
                <Spacing size="md"/>
                <StyledText className="text-xl">
                    {profile.description}
                </StyledText>
                <Spacing size="md"/>
                <StyledView className="flex flex-wrap flex-row w-full">
                    <Frequency frequency={profile.alcohol} habit="Alcohol"/>
                    <StyledView className="w-3"/>
                    <Frequency frequency={profile.smoking} habit="Smoking"/>
                </StyledView>
                <Spacing size="md"/>
                <StyledView className="flex flex-wrap flex-row w-full">
                    {profile.attributes.map( attribute => (
                        <MyButton
                            key={`attribute-${attribute}`}
                            onPressFunction={() => {}}
                            text={attribute}
                            smallButton={true}
                        />
                    ))}
                </StyledView>
                <Spacing size="lg"/>
            </StyledView>
        </StyledView> 
        </StyledScroll>
    )
}

export const ProfileViewMob = observer(ProfileView);
export default ProfileViewMob;