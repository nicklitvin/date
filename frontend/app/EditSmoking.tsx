import { useEffect, useState } from "react";
import { MySimplePage } from "../src/components/SimplePage";
import { generalText, smokingText } from "../src/text";
import { globals } from "../src/globals";
import { MyButton } from "../src/components/Button";
import { StyledView } from "../src/styledElements";
import { Spacing } from "../src/components/Spacing";
import { useStore } from "../src/store/RootStore";
import { EditUserInput, PublicProfile, WithKey } from "../src/interfaces";
import { Redirect, router } from "expo-router";
import { sendRequest } from "../src/utils";
import { URLs } from "../src/urls";
import { observer } from "mobx-react-lite";
import { showToast } from "../src/components/Toast";

export function EditSmoking() {   
    const { receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    if (!profile) router.replace("Error");

    const [frequency, setFrequency] = useState<string|undefined>(profile?.smoking); 
    useEffect( () => {
        if (profile) {
            receivedData.setProfile(profile)
        }
    }, [profile])

    const changeAlcohol = async () => {
        if (!frequency) return

        try {
            const input : WithKey<EditUserInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                setting: globals.settingSmoking,   
                value: frequency
            }
            const response = await sendRequest<void>(URLs.editUser, input);
            if (response.message) {
                showToast("Error",response.message);
            } else {
                setProfile({
                    ...profile!,
                    smoking: frequency
                });
                router.back();
            }
        } catch (err) {
            console.log(err);
        }
    }

    if (!profile) return <></>
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
                    text={generalText.saveChanges}
                />
            }
        />
    )
}

export const EditSmokingMob = observer(EditSmoking)
export default EditSmokingMob;