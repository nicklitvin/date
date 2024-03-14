import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootStore, createStoreProvider} from '../src/store/RootStore';
import { StyledView } from '../src/styledElements';
import { Stack } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";

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
                                <Stack initialRouteName="index" screenOptions={{
                                    headerShown: false
                                }}>
                                    <Stack.Screen name="index"/>
                                </Stack>
                            </StyledView>
                        </StyledView>
                    </StoreProvider>
                </SafeAreaView>
            </SafeAreaProvider>
        </StyledView>
    )
}