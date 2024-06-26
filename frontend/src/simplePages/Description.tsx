import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { descriptionText } from "../text";

interface Props {
    onSubmit: (input : string) => any
    goBack?: () => any
    input?: string
}

export function Description(props : Props) {
    return <MySimplePage
        title={descriptionText.pageTitle}
        subtitle={descriptionText.pageSubtitle}
        pageType="Keyboard"
        goBackFunc={props.goBack}
        content={
            <MyTextInput
                placeholder={descriptionText.inputPlaceholder}
                errorMessage={descriptionText.errorMessage}
                onSubmit={props.onSubmit}
                newLine={true}
                initialInput={props.input}
            />
        }
    />
}

