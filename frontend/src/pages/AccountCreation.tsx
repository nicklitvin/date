import { useEffect, useState } from "react";
import { myText } from "../text";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { MyDateInput } from "../components/DateInput";
import { globals } from "../globals";
import { StyledText, StyledView } from "../styledElements";
import { AgePreferenceInput } from "../components/AgePreferenceInput";
import { UserInput } from "../interfaces";
import axios from "axios";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/RootStore";

type PageType = "Create Profile" | "Name" | "Birthday" | "Gender" | "Gender Preference" |
    "Description" | "Attributes" | "Pictures" | "Age Preference" | "Final";

export const pageOrder : PageType[] = [
    "Create Profile","Name","Birthday", "Gender", "Age Preference", "Gender Preference",
    "Pictures", "Attributes", "Description", "Final"
]

interface Props {
    customPageStart? : number
    customBirthday?: Date,
    returnPageNumber?: (input : number) => number
}

export function AccountCreation(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.customPageStart ?? 0);

    const [name, setName] = useState<string>("");
    const [birthday, setBirthday] = useState<Date>(new Date());
    const [gender, setGender] = useState<string|null>(null);
    const [genderPreference, setGenderPreference] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");
    const [attributes, setAttributes] = useState<string[]>([]);
    const [minAge, setMinAge] = useState<number>(globals.minAge);
    const [maxAge, setMaxAge] = useState<number>(globals.maxAge);
    const { globalState } = useStore();

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    }

    useEffect( () => {
        if (props.returnPageNumber)
            props.returnPageNumber(currentPage)
    }, [currentPage])

    const createUser = async () => {
        const userInput : UserInput = {
            name: name,
            birthday: birthday,
            ageInterest: [minAge, maxAge],
            attributes: attributes,
            description: description,
            email: globalState.email as string,
            gender: gender,
            genderInterest: genderPreference,
            files: []
        };
        try {
            if (globalState.useHttp) {
                await axios.post(globals.URLServer + globals.URLCreateUser, userInput);
            } else {
                globalState.setUserInput(userInput);
            }
        } catch (err) {}
    }

    switch (pageOrder[currentPage]) {
        case "Create Profile":
            return <MySimplePage
                title={myText.createProfileTitle}
                subtitle={myText.createProfileSubtitle}
                content={
                    <MyButton
                        text={myText.continue}
                        onPressFunction={goToNextPage}
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
                        afterSubmit={goToNextPage}
                    />
                }
            />
        case "Birthday":
            return <MySimplePage
                title={myText.birthdayInputTitle}
                subtitle={myText.birthdayInputSubtitle}
                content={
                    <MyDateInput
                        afterSubmit={goToNextPage}
                        saveDate={setBirthday}
                        customDate={props.customBirthday}
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
                                    gender == val ? setGender(null) : setGender(val);
                                }}
                            />
                        )}
                        <MyButton
                            text={myText.continue}
                            onPressFunction={() => {
                                if (gender) {
                                    goToNextPage()
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
                                    goToNextPage()
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
                        afterSubmit={goToNextPage}
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
                                            const foundIndex = attributes.findIndex( 
                                                selected => selected == content.value
                                            )
                                            if (foundIndex > -1) {
                                                setAttributes(
                                                    attributes.filter( (_,index) =>
                                                        foundIndex != index
                                                    )
                                                )
                                            } else {
                                                setAttributes(
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
                                    goToNextPage()
                                }
                            }}
                        />
                    </>
                }
            />
        case "Age Preference":
            return <MySimplePage
                title={myText.agePreferenceInputTitle}
                subtitle={myText.agePreferenceInputSubtitle}
                content={
                    <>
                        <AgePreferenceInput
                            minAge={minAge}
                            maxAge={maxAge}
                            setMinAge={setMinAge}   
                            setMaxAge={setMaxAge}
                        />
                        <MyButton
                            text={myText.continue}
                            onPressFunction={ () => {
                                if (minAge <= maxAge) {
                                    goToNextPage()
                                }
                            }}
                        />
                    </>
                }
            />
        case "Final":
            return <MySimplePage
                title={myText.finalInputTitle}
                subtitle={myText.finalInputSubtitle}
                content={
                    <MyButton
                        text={myText.continue}
                        onPressFunction={createUser}
                    />
                }
            />
        case "Pictures":
            return <MySimplePage
                title={myText.uploadInputTitle}
                subtitle={myText.uploadInputSubtitle}
                content={
                    <MyButton
                        text={myText.continue}
                        onPressFunction={goToNextPage}
                    />
                }
            />
    }
}

export const AccountCreationMob = observer(AccountCreation);