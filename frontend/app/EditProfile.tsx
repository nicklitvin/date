import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { editProfileText } from "../src/text";
import { StyledScroll, StyledText, StyledView } from "../src/styledElements";
import { globals } from "../src/globals";
import { Picture } from "../src/components/Picture";
import { MyButton } from "../src/components/Button";
import { Spacing } from "../src/components/Spacing";
import { Redirect, router } from "expo-router";
import { useStore } from "../src/store/RootStore";

export function EditProfile() {
    const { receivedData } = useStore();
    const profile = receivedData.profile;
    if (!profile) return <Redirect href="Error"/>

    return (
        <StyledScroll>
        <StyledView className="w-full h-full bg-back">
            <PageHeader
                title={editProfileText.pageTitle}
                imageType="Edit"
            />
            <StyledView className="w-full px-5">

            <StyledText className="font-bold text-xl">
                {editProfileText.headerPictures}
            </StyledText>
            <StyledView className="w-full flex flex-wrap flex-row items-center">
            {Array.from({length: globals.maxUploads}).map( (_,index) => (
                index < profile.images.length ? 
                <StyledView className="m-2" key={`edit-${profile.images[index]}`}>
                    <Picture
                        source={profile.images[index]}
                        switching={false}
                        disable={true}
                    />
                </StyledView> :    
                <StyledView 
                    className="w-[102px] h-[136px] rounded-xl border border-front m-2"
                    key={`edit-empty-${index}`}
                />
            ))}
            </StyledView>
            <Spacing size="md"/>
            <StyledView className="w-full items-center flex">
                <MyButton
                    text={editProfileText.editImages}
                    onPressFunction={() => {router.push("/EditPictures")}}
                />
            </StyledView>
            <Spacing size="lg"/>
            <StyledText className="font-bold text-xl">    
                {editProfileText.headerDescription}
            </StyledText>
            <Spacing size="md"/>
            <MyButton
                text={profile.description}
                onPressFunction={() => {router.push("/EditDescription")}}
                fullSize={true}
            />
            <Spacing size="lg"/>
            <StyledText className="font-bold text-xl">
                {editProfileText.headerAttributes}
            </StyledText>
            <Spacing size="md"/>
            <StyledView className="flex flex-start w-full flex-row flex-wrap">
                {profile.attributes.map( val => (
                    <MyButton
                        key={`attribute-${val}`}
                        text={val}
                        onPressFunction={() => {}}
                        smallButton={true}
                    />
                ))}
            </StyledView>
            <Spacing size="lg"/>
            <StyledView className="w-full flex items-center">
                <MyButton
                    text={editProfileText.editAttributes}
                    onPressFunction={() => {router.push("/EditAttributes")}}
                />
            </StyledView>
            <Spacing size="lg"/>

            </StyledView>
        </StyledView>
        </StyledScroll>
    )
}

export const EditProfileMob = observer(EditProfile);
export default EditProfileMob;