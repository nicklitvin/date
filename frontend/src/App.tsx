import { HomeMob } from './pages/Home';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootStore, StoreProvider, createRootInstance } from './store/RootStore';

export function App() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StoreProvider value={createRootInstance()}>
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
    return (
        <StoreProvider value={createRootInstance()}>
            <HomeMob/>
        </StoreProvider>
    )
} 

interface CustomAppProps { 
    customStore : RootStore
}

export function CustomApp(props : CustomAppProps) {
    return (
        <StoreProvider value={props.customStore}>
            <HomeMob/>
        </StoreProvider>
    )
}