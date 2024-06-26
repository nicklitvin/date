import { observer } from "mobx-react-lite";
import { MySimplePage } from "../src/components/SimplePage";
import { MyTextInput } from "../src/components/TextInput";
import { descriptionText, editProfileText } from "../src/text";
import { useStore } from "../src/store/RootStore";
import { Redirect, router } from "expo-router";
import { EditUserInput, PublicProfile, WithKey } from "../src/interfaces";
import { globals } from "../src/globals";
import { URLs } from "../src/urls";
import { sendRequest } from "../src/utils";
import { useEffect, useState } from "react";
import { showToast } from "../src/components/Toast";

export function EditDescription() {
    const { receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    
    useEffect( () => {
        if (profile) {
            receivedData.setProfile(profile);
        } else {
            router.replace("Error");
        }
    }, [profile])

    const editDescription = async (description: string) => {
        try {
            const input : WithKey<EditUserInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                setting: globals.settingDescription,
                value: description
            }
            const response = await sendRequest<void>(URLs.editUser, input);
            if (response.message) {
                showToast("Error", response.message);
            } else {
                setProfile({
                    ...profile!,
                    description: description
                })
                router.back();
            }
        } catch (err) {
            showToast("Error", editProfileText.cannotChangeDescription)
            console.log(err)
        }
    }

    return <MySimplePage
        title={descriptionText.pageTitle}
        subtitle={descriptionText.pageSubtitle}
        pageType="Keyboard"
        content={
            <MyTextInput
                placeholder={descriptionText.inputPlaceholder}
                errorMessage={descriptionText.errorMessage}
                onSubmit={editDescription}
                newLine={true}
                initialInput={profile?.description}
                dontClearAfterSubmit={true}
            />
        }
    />
}
const EditDescriptionMob = observer(EditDescription);
export default EditDescriptionMob;

