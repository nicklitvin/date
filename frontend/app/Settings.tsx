import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { generalText, settingsText } from "../src/text";
import { StyledButton, StyledText, StyledView } from "../src/styledElements";
import { EditUserInput, SettingData } from "../src/interfaces";
import { URLs } from "../src/urls";
import { MyButton } from "../src/components/Button";
import { useStore } from "../src/store/RootStore";
import Toggle from "react-native-toggle-element"
import { useEffect, useState } from "react";
import { sendRequest } from "../src/utils";
import { globals } from "../src/globals";
import { Spacing } from "../src/components/Spacing";
import { MyModal } from "../src/components/Modal";
import { testIDS } from "../src/testIDs";

interface Props {
    disableToggle?: boolean
    noAutoLoad?: boolean
}


export function Settings(props : Props) {
    const {globalState, receivedData} = useStore();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [settings, setSettings] = useState<SettingData[]>(receivedData.settings ?? []);

    useEffect( () => {
        if (props.noAutoLoad) return
        load();   
    })

    useEffect( () => {
        if (settings) {
            receivedData.setSettings(settings);
        }
    }, [settings])

    const load = async () => {
        try {   
            const response = await sendRequest(URLs.getSettings, null);
            setSettings(response.data.data);
        } catch (err) {
            console.log(err);
        }
    }

    const changeSettingValue = async (title : string, value : boolean) => {
        try {
            const input : EditUserInput = {
                setting: title,
                value: value
            }
            const copy = [...settings];
            copy[copy.findIndex(val => val.title == title)] = { title, value };
            setSettings(copy);
            await sendRequest(URLs.editUser, input);

        } catch (err) {
            const copy = [...settings];
            copy[copy.findIndex(val => val.title == title)] = { title, value: !value };
            setSettings(copy);
        }
    }

    const signOut = () => {
        globalState.setEmail(null);
    }

    const deleteAccount = async () => {
        try {
            await sendRequest(URLs.deleteAccount, null);
            signOut();
        } catch (err) {}
    }

    return (
        <StyledView className="w-full h-full bg-back">
        <StyledButton testID={testIDS.load} onPress={load}/> 
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
            {settings.map( setting => (
                <StyledView key={`setting-${setting.title}`}>
                    <StyledView
                        className="flex flex-row w-full items-center px-5 pb-2"
                    >
                        <StyledText className="text-bold text-xl font-bold">
                             {setting.title}
                         </StyledText>
                         <StyledView className="flex-grow"/>
                         <StyledButton
                            testID={`toggle-${setting.title}`}
                            onPress={props.disableToggle ? 
                                () => changeSettingValue(setting.title, !setting.value) : 
                                () => {}
                            }
                            className="border border-front rounded-full"
                        >
                            { props.disableToggle ? null : 
                                <Toggle
                                    value={setting.value}
                                    onPress={ () => changeSettingValue(setting.title, !setting.value)}
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
