import { useState } from "react"
import { StyledInput, StyledText } from "../styledElements"
import classNames from "classnames"
import { Image } from "expo-image"

interface Props {
    placeholder: string
    errorMessage: string
    onSubmit: (message : string) => any
    initialInput?: string
}

export function MyTextInput(props : Props) {
    const [message, setMessage] = useState<string>(props.initialInput ?? "");
    const [showError, setShowError] = useState<boolean>(false);

    return (  
        <>
            <StyledInput 
                className="bg-back border border-front rounded-3xl py-2 px-6"
                value={message}
                onChangeText={(text) => setMessage(text)}

                placeholder={props.placeholder} 
                onSubmitEditing={() => {
                    if (message.length == 0) {
                        setShowError(true);
                    } else {
                        props.onSubmit(message);
                        setMessage("");
                    }
                }}
            />
            {/* <Image
                source="https://static-00.iconduck.com/assets.00/send-icon-512x505-rfnsb0it.png"
            /> */}
            <StyledText className={classNames(
                showError ? "block" : "hidden"
            )}>
                {props.errorMessage}
            </StyledText>
        </>  
    )
}