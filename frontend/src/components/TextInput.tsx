import { useEffect, useState } from "react"
import { StyledButton, StyledImage, StyledInput, StyledText, StyledView } from "../styledElements"
import classNames from "classnames"
import { Image } from "expo-image"

interface Props {
    placeholder: string
    errorMessage: string
    onSubmit: (message : string) => any
    initialInput?: string
    maxLength?: number
    returnError?: (input : boolean) => boolean
    newLine?: boolean
}

export function MyTextInput(props : Props) {
    const [message, setMessage] = useState<string>(props.initialInput ?? "");
    const [showError, setShowError] = useState<boolean>(false);

    useEffect( () => {
        if (props.returnError) props.returnError(showError)
    }, [showError])

    const processSubmit = () => {
        if (message.length == 0) {
            setShowError(true);
        } else {
            props.onSubmit(message);
            setMessage("");
        }
    }

    return (  
        <>
            <StyledView className={classNames(
                "flex justify-start w-full",
            )}>
                <StyledInput 
                    className="bg-back border border-front rounded-3xl py-2 pl-6 pr-12"
                    value={message}
                    onChangeText={(text) => {
                        setShowError(false);
                        setMessage(text);
                    }}
                    placeholder={props.placeholder} 
                    onSubmitEditing={processSubmit}
                    maxLength={props.maxLength ?? 100}
                    multiline={props.newLine ?? false}
                />
                <StyledButton 
                    onPress={processSubmit}
                    className="absolute right-5 w-[20px] h-full flex justify-center"
                >
                    <StyledImage
                        className="w-[20px] h-[20px]"
                        source={require("../../assets/SendTriangle.png")}
                        style={{tintColor: "#000000"}}
                    />
                </StyledButton>
            </StyledView>
            <StyledText className={classNames(
                `text-center text-base`,
                showError ? "block" : "opacity-0"
            )}>
                {props.errorMessage}
            </StyledText>
        </>  
    )
}