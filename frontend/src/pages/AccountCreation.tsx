import { useState } from "react";
import { myText } from "../text";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { MyDateInput } from "../components/DateInput";

type PageType = "Create Profile" | "Name" | "Birthday";
const pageOrder : PageType[] = ["Create Profile","Name","Birthday"]

export function AccountCreation() {
    const [currentPage, setCurrentPage] = useState<number>(0);

    const [name, setName] = useState<string>("");
    const [birthday, setBirthday] = useState<Date>(new Date());

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
    }
}