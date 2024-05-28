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
import { Announcement, APIOutput, JustUserID, LoginOutput, PublicProfile, WithKey } from "../src/interfaces";
import { SocketManager } from "../src/components/SocketManager";
import { addHours, addMinutes } from "date-fns";
import { Announcements } from "./Announcements";

export function Index() {
    const [loading, setLoading] = useState<boolean>(true);
    const { globalState, receivedData } = useStore();
    const [error, setError] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
    const [askedForAnnouncements, setAskedForAnnouncements] = useState<boolean>(false);

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
        receivedData.addSavedChat("goat", Array.from({ length : 20}, (_,index) => ({
            id: String(Math.random()),
            message: String(Math.random()),
            readStatus: true,
            recepientID: "id",
            userID: "goat",
            timestamp: new Date()
        })))
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
        receivedData.setAnnouncements([
            {
                id: "qwejqwle",
                startTime: addHours(new Date(), -1),
                endTime: addHours(new Date(), 1),
                message: "this is a short message",
                title: "Title"
            }, 
            {
                id: "qwejqwlweqe",
                startTime: addHours(new Date(), -1),
                endTime: addHours(new Date(), 1),
                message: "this is a very long message and it might be worth to have some kind of splits in the text such as with the new line character so that it is not just a huge and massive block of text",
                title: "Title 2"
            }
        ])
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

    const tryConnectingSocketManager = async (input : WithKey<{}>) => {
        try {
            const response = await sendRequest<LoginOutput>(URLs.autoLogin, input);
            if (response.data?.socketToken) {
                globalState.setSocketManager(new SocketManager({
                    socketToken: response.data.socketToken, 
                    receivedData,
                    key: response.data.key
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
            key ? tryConnectingSocketManager({ key: key } as WithKey<{}>) : null,
            key ? retrieveOne(
                () => sendRequest(URLs.getMyProfile, {key: key} as WithKey<{}>),
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