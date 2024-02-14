import { useState } from "react";
import { myText } from "../text";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { MyDateInput } from "../components/DateInput";
import { globals } from "../globals";

type PageType = "Create Profile" | "Name" | "Birthday" | "Gender" | "Gender Preference";
export const pageOrder : PageType[] = [
    "Create Profile","Name","Birthday", "Gender", "Gender Preference"
]

interface Props {
    customPageStart? : number
}

export function AccountCreation(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.customPageStart ?? 0);

    const [name, setName] = useState<string>("");
    const [birthday, setBirthday] = useState<Date>(new Date());
    const [gender, setGender] = useState<string|null>(null);

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
    }
}