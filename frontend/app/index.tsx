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
            <Redirect href={"/(tabs)"}/>
        )
    }
    
}

export const IndexMob = observer(Index);
export default IndexMob;