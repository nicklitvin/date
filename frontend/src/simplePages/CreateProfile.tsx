import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { createProfileText } from "../text"

interface Props {
    onSubmit : () => any
    submitText: string
}

export function CreateProfile(props : Props) {
    return <MySimplePage
        title={createProfileText.pageTitle}
        subtitle={createProfileText.pageSubtitle}
        content={
            <MyButton
                text={props.submitText}
                onPressFunction={props.onSubmit}
            />
        }
    />
}