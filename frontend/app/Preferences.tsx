import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { generalText, preferencesText } from "../src/text";
import { globals } from "../src/globals";
import { MyButton } from "../src/components/Button";
import { useEffect, useState } from "react";
import { EditUserInput } from "../src/interfaces";
import axios from "axios";
import { URLs } from "../src/urls";
import { AgePreference } from "../src/simplePages/AgePreference";
import { GenderPreference } from "../src/simplePages/GenderPreference";
import { StyledText, StyledView } from "../src/styledElements";
import classNames from "classnames";
import { sendRequest } from "../src/utils";

export function Preferences() {
    const props : {genderPreference: string[], agePreference: [number,number]}= {
        genderPreference: ["Male"],
        agePreference: [18,28]
    }
    const [initialGenders, setInitialGenders] = useState<string[]>(props.genderPreference);
    const [initialAge, setInitialAge] = useState<[number,number]>(props.agePreference);

    const [genders, setGenders] = useState<string[]>(props.genderPreference); 
    const [minAge, setMinAge] = useState<number>(props.agePreference[0]);
    const [maxAge, setMaxAge] = useState<number>(props.agePreference[1]);
    const [noChanges, setNoChanges] = useState<boolean>(false);

    useEffect( () => {
        setNoChanges(
            minAge == initialAge[0] && maxAge == initialAge[1] &&
            initialGenders.length == genders.length &&
            initialGenders.every( val => genders.includes(val))
        )
    }, [genders,minAge,maxAge])

    const submitChanges = async () => {
        if (noChanges || genders.length == 0) return

        try {
            const genderEdit : EditUserInput = {
                setting: globals.settingGenderPreference,
                value: genders
            }
            const ageEdit : EditUserInput = {
                setting: globals.settingAgePreference,
                value: [minAge, maxAge]
            }

            const response = await Promise.all([
                sendRequest(URLs.editUser, genderEdit),
                sendRequest(URLs.editUser, ageEdit)
            ])
            setInitialGenders(genders);
            setInitialAge([minAge, maxAge]);
            
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <StyledView className="w-full h-full bg-back">
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
                        selectedGenders={props.genderPreference}
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
                    minAge={minAge}
                    maxAge={maxAge}
                    setMaxAge={setMaxAge}
                    setMinAge={setMinAge}
                    embed={true}
                />
            </StyledView>
        </StyledView>
    )
}

export const PreferencesMob = observer(Preferences);
export default PreferencesMob;
