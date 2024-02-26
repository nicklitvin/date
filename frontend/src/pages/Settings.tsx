import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { settingsText } from "../text";
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { EditUserInput, SettingData } from "../interfaces";
import axios from "axios";
import { URLs } from "../urls";
import { MyButton } from "../components/Button";
import { useStore } from "../store/RootStore";
import Toggle from "react-native-toggle-element"
import { useState } from "react";

interface Props {
    settings: SettingData[]
}

export function Settings(props : Props) {
    const {globalState} = useStore();

    const [settings, setSettings] = useState<{[title : string] : boolean}>(
        props.settings.reduce((prev,curr) => ({...prev, [curr.title]: curr.value}),{})
    );

    const changeSettingValue = async (title : string, value : boolean) => {
        try {
            const input : EditUserInput = {
                setting: title,
                value: value
            }
            setSettings({
                ...settings,
                [title]: value
            })
            await axios.post(URLs.server + URLs.editUser, input);

        } catch (err) {
            console.log("err");
        }
    }

    const signOut = () => {
        globalState.setEmail(null);
    }

    const deleteAccount = async () => {
        try {
            await axios.post(URLs.server + URLs.deleteAccount);
            globalState.setEmail(null);
        } catch (err) {}
    }

    return (
        <>
            <PageHeader
                title={settingsText.pageTitle}
                imageSource=""
            />
            <StyledView>
                {props.settings.map( setting => (
                    <StyledView
                        key={`setting-${setting.title}`}
                    >
                        <StyledText>
                            {setting.title}
                        </StyledText>
                        <StyledButton 
                            testID={`toggle-${setting.title}`}
                            onPress={() => changeSettingValue(setting.title, !settings[setting.title])}
                        >
                            <Toggle
                                value={settings![setting.title]}
                            />
                        </StyledButton>
                    </StyledView>
                ))}
                <MyButton
                    text={settingsText.signOut}
                    onPressFunction={signOut}
                />
                <MyButton
                    text={settingsText.deleteAccount}
                    onPressFunction={deleteAccount}
                />
            </StyledView>
        </>
    )
}   

export const SettingsMob = observer(Settings);