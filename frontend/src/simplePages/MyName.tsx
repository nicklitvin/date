import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { myNameText } from "../text";
import { globals } from "../globals";

interface Props {
    onSubmit: (input : string) => any
}

export function MyName(props : Props) {
    return (
        <MySimplePage
            title={myNameText.pageTitle}
            subtitle={myNameText.pageSubtitle}
            marginTop="Keyboard"
            content={
                <MyTextInput
                    placeholder={myNameText.inputPlaceholder}
                    errorMessage={myNameText.inputError}
                    onSubmit={props.onSubmit}
                    maxLength={globals.maxNameLength}
                />
            }
        />
    )
}