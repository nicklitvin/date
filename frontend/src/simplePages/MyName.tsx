import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { StyledView } from "../styledElements";
import { myNameText } from "../text";

interface Props {
    onSubmit: (input : string) => any
}

export function MyName(props : Props) {
    return <MySimplePage
        title={myNameText.pageTitle}
        subtitle={myNameText.pageSubtitle}
        content={
            <>
                <StyledView className="mt-[200px]"/>
                <MyTextInput
                    placeholder={myNameText.inputPlaceholder}
                    errorMessage={myNameText.inputError}
                    onSubmit={props.onSubmit}
                />
            </>
        }
    />
}