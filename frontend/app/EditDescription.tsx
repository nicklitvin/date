import { observer } from "mobx-react-lite";
import { MySimplePage } from "../src/components/SimplePage";
import { MyTextInput } from "../src/components/TextInput";
import { descriptionText } from "../src/text";
import { useStore } from "../src/store/RootStore";
import { Redirect, router } from "expo-router";
import { EditUserInput, PublicProfile, WithKey } from "../src/interfaces";
import { globals } from "../src/globals";
import { URLs } from "../src/urls";
import { sendRequest } from "../src/utils";
import { useEffect, useState } from "react";

export function EditDescription() {
    const { receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    
    useEffect( () => {
        if (profile) {
            receivedData.setProfile(profile);
        } else {
            router.push("Error");
        }
    }, [profile])

    const editDescription = async (description: string) => {
        try {
            const input : WithKey<EditUserInput> = {
                key: receivedData.loginKey,
                setting: globals.settingDescription,
                value: description
            }
            await sendRequest(URLs.editUser, input);
            setProfile({
                ...profile!,
                description: description
            })
            router.back();
        } catch (err) {
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

