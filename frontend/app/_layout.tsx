import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootStore, createStoreProvider} from '../src/store/RootStore';
import { StyledView } from '../src/styledElements';
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";
import { toastConfig } from "../src/components/Toast";
import VerificationMob from "./Verification";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
});

export default function App() {
    const rootStore = new RootStore();
    const StoreProvider = createStoreProvider(rootStore);

    return (
        <StyledView className="flex-1 bg-back">
            <SafeAreaProvider>
                <SafeAreaView style={{flex: 1}}>
                    <StoreProvider value={rootStore}>
                        <StyledView className="w-full h-full flex items-center justify-center">
                            <StyledView className="w-full h-full">
                                <Stack screenOptions={{
                                    headerShown: false
                                }}>
                                    <Stack.Screen name="index"/>
                                    <Stack.Screen name="(tabs)"/>
                                    <Stack.Screen name="Preferences"/>
                                    <Stack.Screen name="Settings"/>
                                    <Stack.Screen name="ProfileView"/>
                                    <Stack.Screen name="EditProfile"/>
                                    <Stack.Screen name="EditPictures"/>
                                    <Stack.Screen name="EditDescription"/>
                                    <Stack.Screen name="EditAttributes"/>
                                    <Stack.Screen name="EditAlcohol"/>
                                    <Stack.Screen name="EditSmoking"/>
                                    <Stack.Screen name="AccountCreation"/>
                                    <Stack.Screen name="Error"/>
                                    <Stack.Screen name="Chat"/>
                                    <Stack.Screen name="Verification"/>
                                    <Stack.Screen name="Reported"/>
                                </Stack>
                            </StyledView>
                        </StyledView>
                    </StoreProvider>
                </SafeAreaView>
            </SafeAreaProvider>
            <Toast config={toastConfig}/>
        </StyledView>
    )
}