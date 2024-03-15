import { observer } from "mobx-react-lite";
import { MySimplePage } from "../src/components/SimplePage";
import { MyTextInput } from "../src/components/TextInput";
import { descriptionText } from "../src/text";
import { useStore } from "../src/store/RootStore";
import { router } from "expo-router";
import { EditUserInput } from "../src/interfaces";
import { globals } from "../src/globals";
import axios from "axios";
import { URLs } from "../src/urls";
import { createTimeoutSignal } from "../src/utils";

export function EditDescription() {
    const { receivedData } = useStore();

    const editDescription = async (description: string) => {
        try {
            const input : EditUserInput = {
                setting: globals.settingDescription,
                value: description
            }
            const response = await axios.post(URLs.server + URLs.editUser, input, {
                signal: createTimeoutSignal()
            })
            receivedData.setProfile(response.data);
            router.back();
        } catch (err) {
            console.log(err)
        }
    }

    return <MySimplePage
        title={descriptionText.pageTitle}
        subtitle={descriptionText.pageSubtitle}
        marginTop="Keyboard"
        content={
            <MyTextInput
                placeholder={descriptionText.inputPlaceholder}
                errorMessage={descriptionText.errorMessage}
                onSubmit={editDescription}
                newLine={true}
                initialInput={receivedData.profile?.description}
            />
        }
    />
}
const EditDescriptionMob = observer(EditDescription);
export default EditDescriptionMob;

