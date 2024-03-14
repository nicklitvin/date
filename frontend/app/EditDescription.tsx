import { MySimplePage } from "../src/components/SimplePage";
import { MyTextInput } from "../src/components/TextInput";
import { descriptionText } from "../src/text";

interface Props {
    onSubmit: (input : string) => any
    goBack?: () => any
    input?: string
}

export function EditDescription() {
    const props : Props = {
        onSubmit: () => {}
    }

    return <MySimplePage
        title={descriptionText.pageTitle}
        subtitle={descriptionText.pageSubtitle}
        marginTop="Keyboard"
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
export default EditDescription;

