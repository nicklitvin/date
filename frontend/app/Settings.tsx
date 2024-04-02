import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { generalText, settingsText } from "../src/text";
import { StyledButton, StyledText, StyledView } from "../src/styledElements";
import { EditPushTokenInput, EditUserInput, SettingData, WithKey } from "../src/interfaces";
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
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Redirect } from "expo-router";

interface Props {
    disableToggle?: boolean
    noAutoLoad?: boolean
}

export function Settings(props : Props) {
    const {globalState, receivedData} = useStore();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [settings, setSettings] = useState<SettingData[]>(receivedData.settings ?? []);
    const [redirect, setRedirect] = useState<boolean>(false);

    useEffect( () => {
        if (props.noAutoLoad) return
        load();   
    })

    useEffect( () => {
        if (settings) {
            receivedData.setSettings(settings);
        }
    }, [settings])

    const updatePushToken = async () => {
        if (Platform.OS == "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.DEFAULT,
            })
        }


        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                return;
            }
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas.projectId,
            });
            const input : WithKey<EditPushTokenInput> = {
                token: token.data,
                key: receivedData.loginKey
            }
            await sendRequest(URLs.updatePushToken, input)

            globalState.setExpoPushToken(token.data);
        }
    }

    const load = async () => {
        try {
            const input : WithKey<{}> = {
                key: receivedData.loginKey
            }  
            const response = await sendRequest(URLs.getSettings, input);
            setSettings(response.data.data);
        } catch (err) {
            console.log(err);
        }
    }

    const changeSettingValue = async (title : string, value : boolean) => {
        try {
            if (!globalState.expoPushToken && title.includes("notification")) {
                try {
                    await updatePushToken();
                } catch (err) {
                    console.log(err);
                    return
                }
            }

            const input : WithKey<EditUserInput> = {
                key: receivedData.loginKey,
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
        receivedData.setProfile(null);
        // globalState.setEmail(null);
        if (!props.disableToggle)
            setRedirect(true);
    }

    const deleteAccount = async () => {
        try {
            const input : WithKey<{}> = {
                key: receivedData.loginKey
            } 
            await sendRequest(URLs.deleteAccount, input);
            signOut();
        } catch (err) {}
    }

    if (redirect) return <Redirect href="SignIn"/>
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
