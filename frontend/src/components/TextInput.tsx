import { useState } from "react"
import { StyledInput, StyledText } from "../styledElements"
import classNames from "classnames"

interface Props {
    placeholder: string
    errorMessage: string
    saveMessage: (message: string) => void
    afterSubmit: Function
}

export function MyTextInput(props : Props) {
    const [message, setMessage] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);

    return (  
        <>
            <StyledInput 
                value={message}
                onChangeText={(text) => setMessage(text)}

                placeholder={props.placeholder} 
                onSubmitEditing={() => {
                    if (message.length == 0) {
                        setShowError(true);
                    } else {
                        props.saveMessage(message)
                        props.afterSubmit()
                    }
                }}
            />
            <StyledText className={classNames(
                showError ? "block" : "hidden"
            )}>
                {props.errorMessage}
            </StyledText>
        </>  
    )
}