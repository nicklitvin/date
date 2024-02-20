import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { myNameText } from "../text";

interface Props {
    onSubmit: (input : string) => any
}

export function MyName(props : Props) {
    return <MySimplePage
        title={myNameText.pageTitle}
        subtitle={myNameText.pageSubtitle}
        content={
            <MyTextInput
                placeholder={myNameText.inputPlaceholder}
                errorMessage={myNameText.inputError}
                onSubmit={props.onSubmit}
            />
        }
    />
}