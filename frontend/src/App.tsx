import { HomeMob } from './pages/Home';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootStore, createStoreProvider} from './store/RootStore';

export function App() {
    const rootStore = new RootStore();
    const StoreProvider = createStoreProvider(rootStore);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StoreProvider value={rootStore}>
                    <HomeMob/>
                </StoreProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

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