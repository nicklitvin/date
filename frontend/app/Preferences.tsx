import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { generalText, preferencesText } from "../src/text";
import { globals } from "../src/globals";
import { MyButton } from "../src/components/Button";
import { useEffect, useState } from "react";
import { EditUserInput, JustUserID, Preferences, WithKey } from "../src/interfaces";
import { URLs } from "../src/urls";
import { AgePreference } from "../src/simplePages/AgePreference";
import { GenderPreference } from "../src/simplePages/GenderPreference";
import { StyledButton, StyledText, StyledView } from "../src/styledElements";
import classNames from "classnames";
import { sendRequest } from "../src/utils";
import { useStore } from "../src/store/RootStore";
import { testIDS } from "../src/testIDs";
import Toast from "react-native-toast-message";

interface Props {
    noAutoLoad?: boolean
    returnGenderCount?: (input : number) => void
    returnMinAge?: (input : number) => void
    returnMaxAge?: (input : number) => void
}

export function PreferencePage(props : Props) {
    const { globalState, receivedData } = useStore();
    const savedPreferences = receivedData.preferences;

    const [genders, setGenders] = useState<string[]>(savedPreferences?.genderPreference ?? []); 
    const [agePreference, setAgePreference] = useState<[number,number]>(savedPreferences?.agePreference ?? [
        globals.minAge, globals.maxAge
    ])
    const [noChanges, setNoChanges] = useState<boolean>(false);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect( () => {
        if (firstLoad) {
            setFirstLoad(false)
            if (props.noAutoLoad) return
            if (!savedPreferences) load();
        }
    }, [firstLoad])

    useEffect( () => {
        if (props.returnGenderCount) props.returnGenderCount(genders.length);
        if (props.returnMinAge) props.returnMinAge(agePreference[0]);
        if (props.returnMaxAge) props.returnMaxAge(agePreference[1]);

        if (!savedPreferences) {
            setNoChanges(true);
            return;
        }

        setNoChanges(
            agePreference[0] == savedPreferences?.agePreference[0] && 
            agePreference[1] == savedPreferences?.agePreference[1] &&
            genders.length == savedPreferences.genderPreference.length && 
            genders.every( val => savedPreferences.genderPreference.includes(val))
        )
    }, [genders, agePreference, savedPreferences])

    const load = async () => {
        try {
            const input : WithKey<JustUserID> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey
            }
            const response = await sendRequest<Preferences>(URLs.getPreferences, input);
            if (response.message) {
                Toast.show({
                    type: "error",
                    text1: response.message
                })
            } else if (response.data) {
                receivedData.setPreferences(response.data);
                setGenders(response.data.genderPreference);
                setAgePreference(response.data.agePreference);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const submitChanges = async () => {
        if (noChanges || genders.length == 0) return

        try {
            const genderEdit : WithKey<EditUserInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                setting: globals.settingGenderPreference,
                value: genders
            }
            await sendRequest(URLs.editUser, genderEdit);
            
            const ageEdit : WithKey<EditUserInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                setting: globals.settingAgePreference,
                value: agePreference
            }
            await sendRequest(URLs.editUser, ageEdit);
            receivedData.setPreferences({
                agePreference: agePreference,
                genderPreference: genders
            })
            receivedData.setSwipeFeed(null);
            globalState.resetSwipeStatus();
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledView className="w-full h-full bg-back">
            <StyledButton onPress={load} testID={testIDS.load}/>
            <PageHeader
                title={preferencesText.pageTitle}
                imageType="Preferences"
                rightContent={
                    <MyButton
                        invertColor={noChanges}
                        smallButton={true}
                        danger={genders.length == 0}
                        text={noChanges ? generalText.saved : generalText.saveChanges}
                        onPressFunction={submitChanges}
                        saveChange={true}
                    />
                }
            />
            <StyledView className="px-5">
                <StyledText className="font-bold text-xl pt-4 pb-2">
                    {preferencesText.headerGender}
                </StyledText>
                <GenderPreference
                    genders={globals.genders}
                    genderState={genders}
                    embed={true}
                    setGenders={setGenders}
                    smallButtons={true}
                />
                <StyledText className={classNames(
                    "font-base text-danger",
                    genders.length == 0 ? "opacity-100" : "opacity-0"
                )}>
                    {preferencesText.selectGender}
                </StyledText>
                <StyledText className="font-bold text-xl pt-4 pb-2">
                    {preferencesText.headerAgePreference}
                </StyledText>
                <AgePreference
                    ages={agePreference}
                    setAges={setAgePreference}
                    onSubmit={() => {}}
                    embed={true}
                />
            </StyledView>
        </StyledView>
    )
}

export const PreferencesMob = observer(PreferencePage);
export default PreferencesMob;
