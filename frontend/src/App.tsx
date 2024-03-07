import { HomeMob } from './pages/Home';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootStore, createStoreProvider} from './store/RootStore';
import { StyledView } from './styledElements';

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
                                <HomeMob/>
                            </StyledView>
                        </StyledView>
                    </StoreProvider>
                </SafeAreaView>
            </SafeAreaProvider>
        </StyledView>
    )
}

export function CustomAppDefault() {
    const rootStore = new RootStore();
    const StoreProvider = createStoreProvider(rootStore);

    return (
        <StoreProvider value={rootStore}>
            <HomeMob/>
        </StoreProvider>
    )
} 

interface CustomAppProps { 
    customStore : RootStore
}

export function CustomApp(props : CustomAppProps) {
    const StoreProvider = createStoreProvider(props.customStore);

    return (
        <StoreProvider value={props.customStore}>
            <HomeMob/>
        </StoreProvider>
    )
}