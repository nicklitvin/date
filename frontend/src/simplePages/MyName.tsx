import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { myNameText } from "../text";
import { globals } from "../globals";

interface Props {
    onSubmit: (input : string) => any
    goBack?: () => any
    input?: string
}

export function MyName(props : Props) {
    return (
        <MySimplePage
            title={myNameText.pageTitle}
            subtitle={myNameText.pageSubtitle}
            marginTop="Keyboard"
            goBackFunc={props.goBack}
            content={
                <MyTextInput
                    placeholder={myNameText.inputPlaceholder}
                    errorMessage={myNameText.inputError}
                    onSubmit={props.onSubmit}
                    maxLength={globals.maxNameLength}
                    initialInput={props.input}
                />
            }
        />
    )
}