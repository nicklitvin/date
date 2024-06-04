import { Redirect, router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../src/store/RootStore";
import { MySimplePage } from "../src/components/SimplePage";
import { globals } from "../src/globals";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { sendRequest } from "../src/utils";
import { URLs } from "../src/urls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { noWifiText } from "../src/text";
import { MyButton } from "../src/components/Button";
import Loading from "./Loading";
import { Announcement, APIOutput, JustUserID, LoginOutput, PublicProfile, WithKey } from "../src/interfaces";
import { SocketManager } from "../src/components/SocketManager";
import { Announcements } from "./Announcements";
import { sampleAttributes, sampleChatPreviews, sampleClientIDs, sampleNewMatches, samplePreferences, sampleProfile, sampleSavedChat, sampleSettings, sampleStats, sampleSubscribed, sampleSwipeFeed } from "../src/sample";

export function Index() {
    const [loading, setLoading] = useState<boolean>(true);
    const { globalState, receivedData } = useStore();
    const [error, setError] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const navigation = useNavigation();

    const setSampleData = () => {
        globalState.resetSwipeStatus();
        receivedData.setProfile(sampleProfile);
        receivedData.setSubscription(sampleSubscribed);
        receivedData.setStats(sampleStats)
        receivedData.setNewMatches(sampleNewMatches);
        receivedData.setChatPreviews(sampleChatPreviews);
        receivedData.addSavedChat("goat", sampleSavedChat);
        receivedData.setSwipeFeed(sampleSwipeFeed);
        // receivedData.setAnnouncements(sampleAnnouncements);
        receivedData.setSettings(sampleSettings);
        receivedData.setClientIDs(sampleClientIDs);
        receivedData.setAttributes(sampleAttributes);
        receivedData.setPreferences(samplePreferences);
    }

    const retrieveOne = async (request : Function, set : Function) => {
        try {
            const response : APIOutput<any> = await request();
            if (response.data) {
                set(response.data);
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            // setError(true);
            return false;
        }
    }

    const tryConnectingSocketManager = async (input : WithKey<void>) => {
        try {
            const response = await sendRequest<LoginOutput>(URLs.autoLogin, input);
            if (response.data?.socketToken) {
                globalState.setSocketManager(new SocketManager({
                    socketToken: response.data.socketToken, 
                    receivedData,
                    key: response.data.key,
                    navigation: navigation
                }))
            }
        } catch (err) {
            console.log(err);
        }
    }

    const retrieveData = async (key : string|null) => {
        const output = await Promise.all([
            retrieveOne(
                () => sendRequest(URLs.getClientIDs, null),
                (data : any) => receivedData.setClientIDs(data)
            ),
            retrieveOne(
                () => sendRequest(URLs.getAttributes, null),
                (data: any) => receivedData.setAttributes(data)
            ),
            key ? tryConnectingSocketManager({ key: key } as WithKey<void>) : null,
            key ? retrieveOne(
                () => sendRequest(URLs.getMyProfile, {key: key} as WithKey<void>),
                (data : any) => receivedData.setProfile(data)
            ) : null,
        ]);

        const profile : PublicProfile = output[3];
        if (profile?.id) {
            await getAnnouncements();
        }

        if (!output[0]) {
            setError(true);
        }
    }

    const getAnnouncements = async () => {
        if (!receivedData.profile?.id) return 

        const input : WithKey<JustUserID> = {
            key: receivedData.loginKey,
            userID: receivedData.profile.id
        }
        const response = await sendRequest<Announcement[]>(URLs.getAnnouncements, input);
        if (response.data) {
            receivedData.setAnnouncements(response.data);
        }
    }

    const loadData = async () => {
        const key = await AsyncStorage.getItem(globals.storageloginKey);
        if (key) receivedData.setLoginKey(key);

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
            if (finalStatus == 'granted') {
                const token = await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas.projectId,
                });
                globalState.setExpoPushToken(token.data);
            }
        }

        if (globals.useSample) {
            setSampleData();
        } else {
            try {
                await retrieveData(key)
            } catch (err) {
                console.log(err);
            }
        }
    }

    useEffect( () => {
        const func = async () => {
            setFirstLoad(false);
            await loadData();
            setLoading(false);
        }
        if (firstLoad) {
            func();
        }
    }, [firstLoad])

    const reload = async () => {
        setError(false);
        setLoading(true);
        await loadData()
        setLoading(false);
    }

    if (receivedData.announcements && receivedData.announcements.length > 0) {
        return <Announcements />
    } else if (loading) {
        return <Loading/>
    } else if (error) {
        return <MySimplePage
            title={noWifiText.pageTitle}
            subtitle={noWifiText.pageSubtitle}
            content={
                <MyButton
                    onPressFunction={reload}
                    text={noWifiText.button}
                />
        }
    />
    } else if (receivedData.profile && (globalState.socketManager || globals.useSample)) {
        return <Redirect href="(tabs)"/>
    } else if (receivedData.clientIDs) {
        return <Redirect href="SignIn"/>
    } else {
        return (
            <Loading/>
        )  
    }
}

export const IndexMob = observer(Index);
export default IndexMob;