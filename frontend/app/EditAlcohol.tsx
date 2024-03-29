import { useEffect, useState } from "react";
import { MySimplePage } from "../src/components/SimplePage";
import { alcoholText, generalText } from "../src/text";
import { globals } from "../src/globals";
import { MyButton } from "../src/components/Button";
import { StyledView } from "../src/styledElements";
import { Spacing } from "../src/components/Spacing";
import { observer } from "mobx-react-lite";
import { useStore } from "../src/store/RootStore";
import { Redirect, router } from "expo-router";
import { EditUserInput, PublicProfile } from "../src/interfaces";
import { sendRequest } from "../src/utils";
import { URLs } from "../src/urls";

export function Alcohol() {    
    const { receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    if (!profile) return <Redirect href="Error"/>

    const [frequency, setFrequency] = useState<string|undefined>(profile.alcohol);

    useEffect( () => {
        if (profile) {
            receivedData.setProfile(profile)
        }
    }, [profile])

    const changeAlcohol = async () => {
        try {
            const input : EditUserInput = {
                setting: globals.settingAlcohol,   
                value: frequency
            }
            const response = await sendRequest(URLs.editUser, input);
            setProfile(response.data.data);
            router.back();
        } catch (err) {}
    }

    return (
        <MySimplePage
            title={alcoholText.pageTitle}
            subtitle={alcoholText.pageSubtitle}
            beforeGapContent={
                <>
                {globals.frequencies.map( freq => (
                    <StyledView key={`alcohol-${freq}`} className="w-full items-center flex">
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

export const AlcoholMob = observer(Alcohol);
export default AlcoholMob;