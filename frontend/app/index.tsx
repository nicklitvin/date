import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StyledText } from "../src/styledElements";
import { observer } from "mobx-react-lite";
import { useStore } from "../src/store/RootStore";
import { MySimplePage } from "../src/components/SimplePage";

export function Index() {
    const [loading, setLoading] = useState<boolean>(true);
    const { globalState, receivedData } = useStore();

    useEffect( () => {
        try {
            receivedData.setProfile({
                name: "Michael",
                age: 21,
                attributes: ["soccer", "basketball"],
                description: "this is a desceiption askdh askdjh aks dhsk ds dkas daksj daks kad jhask dajsh kasdhjasdhask das dhaskd ask dashd ",
                gender: "Male",
                id: "abc",
                images: [
                    "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*",
                    "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
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
                            "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*",
                            "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
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
                            "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*",
                            "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                        ],
                        alcohol: "Never",
                        smoking: "Never",
                    },
                    messages: [{
                        id: "asd",
                        message: "hi",
                        readStatus: false,
                        recepientID: "asd",
                        timestamp: new Date(2000,0,1),
                        userID: "Me"
                    }]
                }
            ])
            receivedData.setSwipeFeed([
                {
                    name: "Not Michael 2",
                    age: 25,
                    attributes: ["basketball"],
                    description: "this is not michael",
                    gender: "Female",
                    id: "goat",
                    images: [
                        "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*",
                        "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
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
                        "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                    ],
                    alcohol: "Often",
                    smoking: "Often",
                }
            ])
            setLoading(false);
        } catch (err) {}
    })
    
    if (loading) {
        return (
            <MySimplePage
                title="Loading..."
                subtitle="Should not take too long"
            />
        )
    } else {
        return (
            <Redirect href="Verification"/>
        )
    }
    
}

export const IndexMob = observer(Index);
export default IndexMob;