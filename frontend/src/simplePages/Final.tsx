import classNames from "classnames";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
import { StyledText } from "../styledElements";
import { finalText } from "../text";
import { useState } from "react";

interface Props {
    onSubmit: () => any
    submitText: string
}

export function Final(props : Props) {
    const [showError, setShowError] = useState<boolean>(false);

    return <MySimplePage
        title={finalText.pageTitle}
        subtitle={finalText.pageSubtitle}
        content={
            <>
                <MyButton
                    text={props.submitText}
                    onPressFunction={ () => {
                        try {
                            props.onSubmit();
                        } catch (err) {
                            setShowError(true);
                        }
                    }}
                />
                <StyledText className={classNames(
                    showError ? "block" : "hidden"
                )}>
                    {finalText.inputError}
                </StyledText>
            </>
        }
    />
}