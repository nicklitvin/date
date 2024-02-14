import { useState } from "react";
import { myText } from "../text";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
import { MyInput } from "../components/Input";

type PageType = "Create Profile" | "Name" | "Age";
const pageOrder : PageType[] = ["Create Profile", "Name","Age"]

export function AccountCreation() {
    const [currentPage, setCurrentPage] = useState<number>(0);

    const [name, setName] = useState<string>("");

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
                    <MyInput
                        placeholder={myText.nameInputPlaceholder}
                        errorMessage={myText.nameInputError}
                        saveMessage={setName}
                        afterSubmit={ () => setCurrentPage(currentPage + 1)}
                    />
                }
            />
        case "Age":
            return 
    }
}