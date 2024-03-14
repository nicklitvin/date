import { Tabs } from "expo-router";
import { globals } from "../../src/globals";
import { StyledImage } from "../../src/styledElements";

export default function TabLayout() {
    type IconType = "Feed" | "Matches";
    const getIcon = (icon: IconType, focused : boolean) => {
        let image;

        switch (icon) {
            case ("Feed"): image = require("../../assets/Feed.png"); break;
            case ("Matches"): image = require("../../assets/Matches.png"); break;
        }

        return (
            <StyledImage
                source={image}
                className="w-[25px] h-[25px]"
                style={{ tintColor: focused ? globals.red : globals.dark }}
            />
        )
    }

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveBackgroundColor: globals.light,
            tabBarInactiveBackgroundColor: globals.light,
            tabBarShowLabel: false
        }}>
            <Tabs.Screen name="index" options={{href: null}}/>
            <Tabs.Screen name="Feed" 
                options={{
                    tabBarIcon: ({ focused }) => getIcon("Feed", focused)
                }}
            />
            <Tabs.Screen name="Matches" 
                options={{
                    tabBarIcon: ({ focused }) => getIcon("Matches", focused)
                }}
            />
        </Tabs>
    )
}