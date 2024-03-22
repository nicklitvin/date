import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { generalText, preferencesText } from "../src/text";
import { globals } from "../src/globals";
import { MyButton } from "../src/components/Button";
import { useEffect, useState } from "react";
import { EditUserInput, Preferences } from "../src/interfaces";
import { URLs } from "../src/urls";
import { AgePreference } from "../src/simplePages/AgePreference";
import { GenderPreference } from "../src/simplePages/GenderPreference";
import { StyledButton, StyledText, StyledView } from "../src/styledElements";
import classNames from "classnames";
import { sendRequest } from "../src/utils";
import { useStore } from "../src/store/RootStore";
import { testIDS } from "../src/testIDs";

interface Props {
    noAutoLoad?: boolean
    returnGenderCount?: (input : number) => void
    returnMinAge?: (input : number) => void
    returnMaxAge?: (input : number) => void
}

export function PreferencePage(props : Props) {
    const { receivedData } = useStore();
    const [preferences, setPreferences] = useState<Preferences|null>(receivedData.preferences);
    const [genders, setGenders] = useState<string[]>(preferences?.genderPreference ?? []); 
    const [agePreference, setAgePreference] = useState<[number,number]>(preferences?.agePreference ?? [
        globals.minAge, globals.maxAge
    ])
    const [noChanges, setNoChanges] = useState<boolean>(false);

    useEffect( () => {
        if (preferences) {
            receivedData.setPreferences(preferences)
        }
    }, [preferences])

    useEffect( () => {
        if (props.noAutoLoad) return
        load();
    })

    useEffect( () => {
        if (props.returnGenderCount) props.returnGenderCount(genders.length);
        if (props.returnMinAge) props.returnMinAge(agePreference[0]);
        if (props.returnMaxAge) props.returnMaxAge(agePreference[1]);

        if (!preferences) {
            setNoChanges(true);
            return;
        }

        setNoChanges(
            agePreference[0] == preferences?.agePreference[0] && 
            agePreference[1] == preferences?.agePreference[1] &&
            genders.length == preferences.genderPreference.length && 
            genders.every( val => preferences.genderPreference.includes(val))
        )
    }, [genders, agePreference, preferences])

    const load = async () => {
        try {
            const response = await sendRequest(URLs.getPreferences, null);
            const data = response.data.data;
            setPreferences(data);
            setGenders(data.genderPreference);
            setAgePreference(data.agePreference);
        } catch (err) {
            console.log(err);
        }
    }

    const submitChanges = async () => {
        if (noChanges || genders.length == 0) return

        try {
            const genderEdit : EditUserInput = {
                setting: globals.settingGenderPreference,
                value: genders
            }
            await sendRequest(URLs.editUser, genderEdit);
            
            const ageEdit : EditUserInput = {
                setting: globals.settingAgePreference,
                value: agePreference
            }
            await sendRequest(URLs.editUser, ageEdit);

            setPreferences({
                agePreference: agePreference,
                genderPreference: genders
            })
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
                <StyledView className="flex w-full flex-row">
                    <GenderPreference
                        genders={globals.genders}
                        genderState={genders}
                        embed={true}
                        setGenders={setGenders}
                        smallButtons={true}
                    />
                </StyledView>
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
