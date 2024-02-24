import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { generalText, preferencesText } from "../text";
import { globals } from "../globals";
import { MyButton } from "../components/Button";
import { useState } from "react";
import { EditUserInput } from "../interfaces";
import axios from "axios";
import { URLs } from "../urls";
import { AgePreference } from "../simplePages/AgePreference";
import { GenderPreference } from "../simplePages/GenderPreference";

interface Props {
    genderPreference: string[]
    agePreference: [number, number]
}

export function Preferences(props : Props) {
    const [genders, setGenders] = useState<string[]>(props.genderPreference); 
    const [minAge, setMinAge] = useState<number>(props.agePreference[0]);
    const [maxAge, setMaxAge] = useState<number>(props.agePreference[1]);

    const submitChanges = async () => {
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
                axios.post(URLs.server + URLs.editUser, genderEdit),
                axios.post(URLs.server + URLs.editUser, ageEdit)
            ])
            
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <>
            <PageHeader
                title={preferencesText.pageTitle}
                imageSource=""
                rightContent={
                    <MyButton
                        text={generalText.saveChanges}
                        onPressFunction={submitChanges}
                    />
                }
            />
            <GenderPreference
                genders={globals.genders}
                onSubmit={() => {}}
                submitText=""
                embed={true}
                setGenders={setGenders}
            />
            <AgePreference
                minAge={minAge}
                maxAge={maxAge}
                setMaxAge={setMaxAge}
                setMinAge={setMinAge}
                onSubmit={() => {}}
                submitText=""
                embed={true}
            />
        </>
    )
}

export const PreferencesMob = observer(Preferences);
