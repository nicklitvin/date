import { HomeX } from './pages/Home';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootStore, StoreProvider, createRootInstance } from './store/RootStore';

export function App() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StoreProvider value={createRootInstance()}>
                    <HomeX/>
                </StoreProvider>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}   

export function CustomAppDefault() {
    return (
        <StoreProvider value={createRootInstance()}>
            <HomeX/>
        </StoreProvider>
    )
} 

export function CustomApp(customStore : RootStore) {
    return (
        <StoreProvider value={customStore}>
            <HomeX/>
        </StoreProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

