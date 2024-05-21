import { Redirect, router } from "expo-router";
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
import { APIOutput, LoginOutput, WithKey } from "../src/interfaces";
import { SocketManager } from "../src/components/SocketManager";

export function Index() {
    const [loading, setLoading] = useState<boolean>(true);
    const { globalState, receivedData } = useStore();
    const [error, setError] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    const setSampleData = () => {
        globalState.resetSwipeStatus();
        receivedData.setProfile({
            name: "Michael",
            age: 21,
            attributes: ["soccer", "basketball"],
            description: "this is a desceiption askdh askdjh aks dhsk ds dkas daksj daks kad jhask dajsh kasdhjasdhask das dhaskd ask dashd ",
            gender: "Male",
            id: "abc",
            images: [
                {
                    id: "image1",
                    url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                }, 
                {
                    id: "image2",
                    url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                },
            ],
            alcohol: "Often",
            smoking: "Often",
        })
        receivedData.setSubscription({
            ID: "ID",
            subscribed: true,
            endDate: new Date(2025,0,1)
        })
        receivedData.setStats({
            allTime: {
                likedMe: 10,
                dislikedMe: 20,
                myDislikes: 30,
                myLikes: 40
            },
            weekly: [
                {
                    dislikedMe: 10,
                    likedMe: 20,
                    myDislikes: 30,
                    myLikes: 40
                },
                {
                    dislikedMe: 40,
                    likedMe: 30,
                    myDislikes: 20,
                    myLikes: 10
                },
                {
                    dislikedMe: 30,
                    likedMe: 40,
                    myDislikes: 10,
                    myLikes: 20
                },
                {
                    dislikedMe: 20,
                    likedMe: 10,
                    myDislikes: 40,
                    myLikes: 30
                },
            ]
        })

        receivedData.setNewMatches([
            {
                profile: {
                    name: "Not Michael",
                    age: 25,
                    attributes: ["basketball"],
                    description: "this is not michael",
                    gender: "Female",
                    id: "goat",
                    images: [
                        {
                            id: "image1",
                            url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                        }, 
                        {
                            id: "image2",
                            url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                        },
                    ],
                    alcohol: "Never",
                    smoking: "Never",
                },
                timestamp: new Date(2000, 0, 1)
            }
        ])
        receivedData.setChatPreviews([
            {
                profile: {
                    name: "Not Michael 2",
                    age: 25,
                    attributes: ["basketball"],
                    description: "this is not michael",
                    gender: "Female",
                    id: "goat",
                    images: [
                        {
                            id: "image1",
                            url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                        }, 
                        {
                            id: "image2",
                            url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                        },
                    ],
                    alcohol: "Never",
                    smoking: "Never",
                },
                message: {
                    id: "asd",
                    message: "hi",
                    readStatus: false,
                    recepientID: "asd",
                    timestamp: new Date(2000,0,1),
                    userID: "Me"
                }
            }
        ])
        receivedData.setSwipeFeed({
            profiles: [
                {
                    name: "Not Michael 2",
                    age: 25,
                    attributes: ["basketball"],
                    description: "this is not michael",
                    gender: "Female",
                    id: "goat",
                    images: [
                        {
                            id: "image1",
                            url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                        }, 
                        {
                            id: "image2",
                            url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                        },
                    ],
                    alcohol: "Never",
                    smoking: "Never",
                },
                {
                    name: "Not Michael 3",
                    age: 35,
                    attributes: ["basketball"],
                    description: "this is not michael again",
                    gender: "Female",
                    id: "asdqwe",
                    images: [
                        {
                            id: "image1",
                            url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                        }, 
                    ],
                    alcohol: "Often",
                    smoking: "Often",
                }
            ],
            likedMeIDs: []
        })
    }

    const retrieveOne = async (request : Function, set : Function) => {
        try {
            const response : APIOutput<any> = await request();
            if (response.data) {
                set(response.data);
                return true;
            } else {
                return false;
            }
        } catch (err) {
            // setError(true);
            return false;
        }
    }

    const tryConnectingSocketManager = async (input : WithKey<{}>) => {
        try {
            const response = await sendRequest<LoginOutput>(URLs.autoLogin, input);
            if (response.data?.socketToken) {
                globalState.setSocketManager(new SocketManager({
                    socketToken: response.data.socketToken, 
                    receivedData
                }))
            }
        } catch (err) {
            console.log(err);
        }
    }

    const retrieveData = async () => {
        const input = {
            key: receivedData.loginKey
        }

        const [clientIDs] = await Promise.all([
            retrieveOne(
                () => sendRequest(URLs.getClientIDs, null),
                (data : any) => receivedData.setClientIDs(data)
            ),
            tryConnectingSocketManager(input),
            retrieveOne(
                () => sendRequest(URLs.getMyProfile, input),
                (data : any) => receivedData.setProfile(data)
            ),
            retrieveOne(
                () => sendRequest(URLs.getAttributes, null),
                (data: any) => receivedData.setAttributes(data)
            ),
        ])
        if (!clientIDs) {
            setError(true);
        }
    }

    const loadData = async () => {
        const key = await AsyncStorage.getItem(globals.storageloginKey);
        receivedData.setLoginKey(key ?? "");

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
                await retrieveData()
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

    if (loading) {
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