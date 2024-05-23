import Toast from "react-native-toast-message";
import { MySimplePage } from "../src/components/SimplePage";
import { toastConfig } from "../src/components/Toast";

export default function Loading() {
    return (
        <>
            <MySimplePage
                title="Loading..."
                subtitle="Should not take too long"
            />
            <Toast config={toastConfig}/>
        </>
    )
}