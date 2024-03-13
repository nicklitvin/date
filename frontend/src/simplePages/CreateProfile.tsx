import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { StyledView } from "../styledElements"
import { createProfileText } from "../text"

interface Props {
    onSubmit : () => any
    submitText: string
    goBack?: () => any
}

export function CreateProfile(props : Props) {
    return <MySimplePage
        title={createProfileText.pageTitle}
        subtitle={createProfileText.pageSubtitle}
        goBackFunc={props.goBack}
        content={
            <StyledView className="w-full flex items-center">
                <MyButton
                    text={props.submitText}
                    onPressFunction={props.onSubmit}
                />
            </StyledView>
        }
    />
}