import { useState } from "react";
import { myText } from "../text";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { MyDateInput } from "../components/DateInput";
import { globals } from "../globals";
import { StyledButton, StyledText, StyledView } from "../styledElements";

type PageType = "Create Profile" | "Name" | "Birthday" | "Gender" | "Gender Preference" |
    "Description" | "Attributes";
export const pageOrder : PageType[] = [
    "Create Profile","Name","Birthday", "Gender", "Gender Preference", "Description", "Attributes"
]

interface Props {
    customPageStart? : number
}

export function AccountCreation(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.customPageStart ?? 0);

    const [name, setName] = useState<string>("");
    const [birthday, setBirthday] = useState<Date>(new Date());
    const [gender, setGender] = useState<string|null>(null);
    const [genderPreference, setGenderPreference] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");
    const [attributes, setAttributes] = useState<string[]>([]);

    switch (pageOrder[currentPage]) {
        case "Create Profile":
            return <MySimplePage
                title={myText.createProfileTitle}
                subtitle={myText.createProfileSubtitle}
                content={
                    <MyButton
                        text={myText.continue}
                        onPressFunction={() => setCurrentPage(currentPage + 1)}
                    />
                }
            />
        case "Name":
            return <MySimplePage
                title={myText.nameInputTitle}
                subtitle={myText.nameInputSubtitle}
                content={
                    <MyTextInput
                        placeholder={myText.nameInputPlaceholder}
                        errorMessage={myText.nameInputError}
                        saveMessage={setName}
                        afterSubmit={ () => setCurrentPage(currentPage + 1)}
                    />
                }
            />
        case "Birthday":
            return <MySimplePage
                title={myText.birthdayInputTitle}
                subtitle={myText.birthdayInputSubtitle}
                content={
                    <MyDateInput
                        afterSubmit={ () => setCurrentPage(currentPage + 1)}
                        saveDate={setBirthday}
                    />
                }
            />
        case "Gender":
            return <MySimplePage
                title={myText.genderInputTitle}
                subtitle={myText.genderInputSubtitle}
                content={
                    <>
                        {globals.genders.map( (val) => 
                            <MyButton
                                key={`gender-${val}`}
                                text={val}
                                onPressFunction={() => {
                                    gender == val ? setGender(val) : setGender(null);
                                }}
                            />
                        )}
                        <MyButton
                            text={myText.continue}
                            onPressFunction={() => {
                                if (gender) {
                                    setCurrentPage(currentPage + 1)
                                }
                            }}
                        />
                    </>
                }
            />
        case "Gender Preference":
            return <MySimplePage
                title={myText.genderPreferenceInputTitle}
                subtitle={myText.genderPreferenceInputSubtitle}
                content={
                    <>
                        {globals.genders.map( (val) => 
                            <MyButton
                                key={`gender-pref-${val}`}
                                text={val}
                                onPressFunction={() => {
                                    const index = genderPreference.findIndex( 
                                        selected => selected == val
                                    )
                                    if (index > -1) {
                                        setGenderPreference(
                                            genderPreference.splice(index,1)
                                        )
                                    } else {
                                        setGenderPreference(
                                            [...genderPreference, val]
                                        )
                                    }
                                }}
                            />
                        )}
                        <MyButton
                            text={myText.continue}
                            onPressFunction={() => {
                                if (genderPreference.length > 0) {
                                    setCurrentPage(currentPage + 1)
                                }
                            }}
                        />
                    </>
                }
            />
        case "Description":
            return <MySimplePage
                title={myText.descriptionInputTitle}
                subtitle={myText.descriptionInputSubtitle}
                content={
                    <MyTextInput
                        placeholder={myText.decsriptionPlaceholder}
                        errorMessage={myText.descriptionErrorMessage}
                        saveMessage={setDescription}
                        afterSubmit={ () => setCurrentPage(currentPage + 1)}
                    />
                }
            />
        case "Attributes":
            return <MySimplePage
                title={myText.attributesInputTitle}
                subtitle={myText.attributesInputSubtitle}
                content={
                    <>
                        {Object.entries(globals.attributes).map( (entry) =>
                            <StyledView key={`attributeType-${entry}`}>
                                <StyledText>
                                    {entry[0]}
                                </StyledText>
                                {entry[1].map( (content) =>
                                    <MyButton
                                        key={`attribute-${content.value}`}
                                        text={content.value}
                                        onPressFunction={ () => {
                                            const index = attributes.findIndex( 
                                                selected => selected == content.value
                                            )
                                            if (index > -1) {
                                                setAttributes(
                                                    attributes.splice(index,1)
                                                )
                                            } else {
                                                setGenderPreference(
                                                    [...attributes, content.value]
                                                )
                                            }
                                        }}
                                    />
                                )}
                            </StyledView>
                        )}
                        <MyButton
                            text={myText.continue}
                            onPressFunction={ () => {
                                if (attributes.length > 0) {
                                    setCurrentPage(currentPage + 1)
                                }
                            }}
                        />
                    </>
                }
            />
    }
}