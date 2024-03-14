import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { generalText, settingsText } from "../src/text";
import { StyledButton, StyledScroll, StyledText, StyledView } from "../src/styledElements";
import { EditUserInput, SettingData } from "../src/interfaces";
import axios from "axios";
import { URLs } from "../src/urls";
import { MyButton } from "../src/components/Button";
import { useStore } from "../src/store/RootStore";
import Toggle from "react-native-toggle-element"
import { useEffect, useState } from "react";
import { createTimeoutSignal } from "../src/utils";
import { globals } from "../src/globals";
import { Spacing } from "../src/components/Spacing";
import { MyModal } from "../src/components/Modal";

interface Props {
    settings: SettingData[]
    disableToggle?: boolean
}

type Settings = {[title: string] : boolean}

export function Settings() {
    const props : Props = {
        settings: [{title: "title", value: true}]
    }

    const {globalState} = useStore();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [settings, setSettings] = useState<Settings>({});

    useEffect( () => {
        const newSettings : Settings = {};
        for (const setting of props.settings) {
            newSettings[setting.title] = setting.value
        }
        setSettings(newSettings);
    }, [])

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
            await axios.post(URLs.server + URLs.editUser, input, {
                signal: createTimeoutSignal()
            });

        } catch (err) {
            setSettings({
                ...settings,
                [title]: !value
            })
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
        <StyledView className="w-full h-full bg-back">
        <MyModal
            show={showModal}
            buttons={[
                {
                    text: settingsText.modalDelete,
                    danger: true,
                    function: deleteAccount
                },
                {
                    text: generalText.cancel,
                    danger: false,
                    function: () => setShowModal(false)
                },
            ]}
            text={settingsText.modalTitle}
            cancelButtonIndex={1}
        />
        <StyledView className="min-h-full">
            <PageHeader
                title={settingsText.pageTitle}
                imageType="Settings"
            />
            <Spacing size="lg"/>
            {Object.entries(settings).map( setting => (
                <StyledView key={`setting-${setting[0]}`}>
                    <StyledView
                        className="flex flex-row w-full items-center px-5 pb-2"
                    >
                        <StyledText className="text-bold text-xl font-bold">
                             {setting[0]}
                         </StyledText>
                         <StyledView className="flex-grow"/>
                         <StyledButton
                            testID={`toggle-${setting[0]}`}
                            onPress={props.disableToggle ? 
                                () => changeSettingValue(setting[0], !setting[1]) : 
                                () => {}
                            }
                            className="border border-front rounded-full"
                        >
                            { props.disableToggle ? null : 
                                <Toggle
                                    value={setting[1]}
                                    onPress={ () => changeSettingValue(setting[0], !setting[1])}
                                    thumbStyle={{backgroundColor: globals.light}}
                                    thumbButton={{radius: 1000, height: 25, width: 25}}
                                    trackBar={{width: 50, height: 25, activeBackgroundColor: globals.green, inActiveBackgroundColor: globals.red}}
                                />
                            }
                        </StyledButton>
                    </StyledView>
                </StyledView>
            ))}
            <StyledView className="flex-grow"/>
            <StyledView className="flex flex-col items-center w-full">
                <StyledView className="flex flex-grow flex-col-reverse w-full items-center ">
                    <MyButton
                        text={settingsText.deleteAccount}
                        onPressFunction={() => setShowModal(true)}
                        danger={true}
                    />
                    <Spacing size="md"/>
                    <MyButton
                        text={settingsText.signOut}
                        onPressFunction={signOut}
                    />
                </StyledView>
            </StyledView>
            <Spacing size="lg"/>
            
        </StyledView>
        </StyledView>
    )
}   

export const SettingsMob = observer(Settings);
export default SettingsMob;
