import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { generalText, settingsText } from "../src/text";
import { StyledButton, StyledText, StyledView } from "../src/styledElements";
import { EditUserInput, JustUserID, SettingData, UpdatePushTokenInput, WithKey } from "../src/interfaces";
import { URLs } from "../src/urls";
import { MyButton } from "../src/components/Button";
import { useStore } from "../src/store/RootStore";
import { useEffect, useState } from "react";
import { sendRequest } from "../src/utils";
import { globals } from "../src/globals";
import { Spacing } from "../src/components/Spacing";
import { MyModal } from "../src/components/Modal";
import { testIDS } from "../src/testIDs";
import { Linking, Platform, Switch } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useNavigation } from "expo-router";
import Loading from "./Loading";
import { showToast } from "../src/components/Toast";

interface Props {
    disableToggle?: boolean
    noAutoLoad?: boolean
}

export function Settings(props : Props) {
    const {globalState, receivedData} = useStore();
    const settings = receivedData.settings;

    const [showModal, setShowModal] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    const navigation = props.noAutoLoad ? null : useNavigation();

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false);
            if (props.noAutoLoad) return
            if (!settings) load();   
        }
    }, [firstLoad])

    const updatePushToken = async (title : string) => {
        if (Platform.OS == "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.DEFAULT,
            })
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            if (existingStatus !== 'granted') {
                return showToast("Error", settingsText.notificationsDisabledError, Linking.openSettings)
            }
            changeToggleValue(title,true);
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas.projectId,
            });
            const input : WithKey<UpdatePushTokenInput> = {
                userID: receivedData.profile?.id!,
                expoPushToken: token.data,
                key: receivedData.loginKey
            }
            const response = await sendRequest<void>(URLs.updatePushToken, input);
            if (response.message) {
                showToast("Error", response.message)
                changeToggleValue(title,false);
            } else {
                globalState.setExpoPushToken(token.data);
            }
        }
    }

    const load = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            const response = await sendRequest<SettingData[]>(URLs.getSettings, input);
            if (response.message) {
                showToast("Error", response.message)
            } else if (response.data) {
                receivedData.setSettings(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const changeToggleValue = (title : string, value : boolean) => {
        if (!settings) return 
        const copy = [...settings];
        const index = copy.findIndex(val => val.title == title);
        copy[index] = { title: title, value: value, display: copy[index].display };
        receivedData.setSettings(copy);
    }

    const changeSettingValue = async (title : string, value : boolean) => {
        if (!globalState.expoPushToken && title.toLowerCase().includes("notify") && value) {
            return updatePushToken(title)
        }

        const input : WithKey<EditUserInput> = {
            userID: receivedData.profile?.id!,
            key: receivedData.loginKey,
            setting: title,
            value: value
        }
        changeToggleValue(title, value);
        const response = await sendRequest<void>(URLs.editUser, input);
        if (response.message) {
            showToast("Error", response.message)
            changeToggleValue(title,!value)
        }
    }

    const signOut = () => {
        if (showModal) setShowModal(false);
        if (globalState.socketManager) {
            globalState.socketManager.close();
            globalState.setSocketManager(null);
        } 
        receivedData.setProfile(null);
        receivedData.removeLoginKey();
        if (navigation) {
            navigation.reset({
                index: 0,
                routes: [{
                    name: "SignIn" as never
                }]
            })
        }
    }

    const deleteAccount = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            setShowModal(false);
            const response = await sendRequest<void>(URLs.deleteAccount, input);
            if (response.message) {
                showToast("Error", response.message)
            } else {
                showToast("Success", settingsText.deleteSuccess);
                signOut();
            }
        } catch (err) {}
    }

    if (!settings) return (
        <>
            <StyledButton testID={testIDS.load} onPress={load}/> 
            <Loading /> 
        </>
    )
    return (
        <>
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
            {settings.map( setting => (
                <StyledView key={`setting-${setting.title}`} >
                    <StyledView
                        className="flex flex-row w-full items-center px-5 pb-3"
                    >
                        <StyledText className="text-bold text-xl font-bold">
                             {setting.display}
                        </StyledText>
                        <StyledView className="flex-grow"/>
                        <Switch
                            value={setting.value}
                            onValueChange={ () => changeSettingValue(setting.title, !setting.value)}
                            trackColor={{false: globals.dark, true: globals.dark}}
                            thumbColor={setting.value ? globals.green : globals.red}
                        />
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
        </>
        
    )
}   

export const SettingsMob = observer(Settings);
export default SettingsMob;
