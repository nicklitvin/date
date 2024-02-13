import { styled } from 'nativewind';
import { Text, View as RNView, TouchableOpacity as RNTouchableOpacity} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../store/RootStore';
import { observer } from "mobx-react-lite"

const View = styled(RNView);
const TouchableOpacity = styled(RNTouchableOpacity);

function Home() {
    const { counter } = useStore(); 
    
    return (
        <View className="bg-red-500">
            <Text>Open up App.tsx to start working on your app!</Text>
            <Text>{counter.value}</Text>
            <TouchableOpacity
                testID="test"
                onPress={() => {
                    counter.increment();
                }}
                className="p-3 bg-red-800 mt-10"
            >
                <Text>Increment me</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    )
}

export const HomeX = observer(Home);