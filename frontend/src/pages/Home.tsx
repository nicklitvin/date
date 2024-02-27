import { observer } from "mobx-react-lite";
import { MyTextInput } from "../components/TextInput";

export function Home() {
    return (
        <>
            <MyTextInput
                placeholder="placeholder"
                onSubmit={() => {}}
                errorMessage="error"
            />
        </>
    )
}

export const HomeMob = observer(Home);