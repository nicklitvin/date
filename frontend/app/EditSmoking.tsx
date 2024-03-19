import { useState } from "react";
import { MySimplePage } from "../src/components/SimplePage";
import { generalText, smokingText } from "../src/text";
import { globals } from "../src/globals";
import { MyButton } from "../src/components/Button";
import { StyledView } from "../src/styledElements";
import { Spacing } from "../src/components/Spacing";
import { useStore } from "../src/store/RootStore";
import { EditUserInput, PublicProfile } from "../src/interfaces";
import { Redirect, router } from "expo-router";
import { sendRequest } from "../src/utils";
import { URLs } from "../src/urls";
import { observer } from "mobx-react-lite";

export function EditSmoking() {   
    const { receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    if (!profile) return <Redirect href="Error"/>

    const [frequency, setFrequency] = useState<string|undefined>(profile.smoking); 

    const changeAlcohol = async () => {
        try {
            const input : EditUserInput = {
                setting: globals.settingSmoking,   
                value: frequency
            }
            const response = await sendRequest(URLs.editUser, input);
            setProfile(response.data.data);
            router.back();
        } catch (err) {}
    }

    return (
        <MySimplePage
            title={smokingText.pageTitle}
            subtitle={smokingText.pageSubtitle}
            beforeGapContent={
                <>
                {globals.frequencies.map( freq => (
                    <StyledView key={`smoking-${freq}`} className="w-full items-center flex">
                        <MyButton
                            text={freq}
                            onPressFunction={() => frequency == freq ? setFrequency("") : setFrequency(freq)}
                            invertColor={frequency == freq}
                        />
                        <Spacing size="md"/>
                    </StyledView>
                ))}
                </>
            }
            content={
                <MyButton
                    onPressFunction={() => {
                        if (frequency) changeAlcohol()
                    }}
                    text={generalText.continue}
                />
            }
        />
    )
}

export const EditSmokingMob = observer(EditSmoking)
export default EditSmokingMob;