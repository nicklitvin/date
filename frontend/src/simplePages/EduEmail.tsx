import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { eduEmailText } from "../text";

interface Props {
    onSubmit : (input : string) => any
}

export function EduEmail(props : Props) {
    return <MySimplePage
        title={eduEmailText.pageTitle}
        subtitle={eduEmailText.pageSubtitle}
        content={<MyTextInput
            placeholder={eduEmailText.inputPlaceholder}
            errorMessage={eduEmailText.inputError}
            onSubmit={props.onSubmit}
        />}
    />
}