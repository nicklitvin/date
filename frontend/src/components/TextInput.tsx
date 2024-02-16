import { useState } from "react"
import { StyledInput, StyledText } from "../styledElements"
import classNames from "classnames"

interface Props {
    placeholder: string
    errorMessage: string
    afterSubmit: Function
    saveMessage?: (message: string) => void
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
                        if (props.saveMessage)
                            props.saveMessage(message)
                        props.afterSubmit(message)
                        setMessage("");
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