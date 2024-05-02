import { Tabs } from "expo-router";
import { globals } from "../../src/globals";
import { StyledImage } from "../../src/styledElements";
import { useEffect, useState } from "react";
import { URLs } from "../../src/urls";

export default function TabLayout() {
    type IconType = "Feed" | "Matches" | "Profile" | "Stats";
    const getIcon = (icon: IconType, focused : boolean) => {
        let image;

        switch (icon) {
            case ("Feed"): image = require("../../assets/Feed.png"); break;
            case ("Matches"): image = require("../../assets/Matches.png"); break;
            case ("Profile"): image = require("../../assets/Profile.png"); break;
            case ("Stats"): image = require("../../assets/Stats.png"); break;
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
            <Tabs.Screen name="Profile" 
                options={{
                    tabBarIcon: ({ focused }) => getIcon("Profile", focused)
                }}
            />
            <Tabs.Screen name="Stats" 
                options={{
                    tabBarIcon: ({ focused }) => getIcon("Stats", focused)
                }}
            />
        </Tabs>
    )
}