import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootStore, createStoreProvider} from '../src/store/RootStore';
import { StyledView } from '../src/styledElements';
import { Stack } from "expo-router";

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
                                    <Stack.Screen name="AccountCreation"/>
                                    <Stack.Screen name="Error"/>
                                    <Stack.Screen name="Chat"/>
                                </Stack>
                            </StyledView>
                        </StyledView>
                    </StoreProvider>
                </SafeAreaView>
            </SafeAreaProvider>
        </StyledView>
    )
}