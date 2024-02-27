import { useState } from "react"
import { StyledButton, StyledImage, StyledInput, StyledText, StyledView } from "../styledElements"
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
            <StyledView className={classNames(
                "flex justify-start",
            )}>
                <StyledInput 
                    className="bg-back border border-front rounded-3xl py-2 pl-6 pr-12"
                    value={message}
                    onChangeText={(text) => setMessage(text)}
                    multiline={true}
                    numberOfLines={1}
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
                <StyledButton 
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
                showError ? "block" : "hidden"
            )}>
                {props.errorMessage}
            </StyledText>
        </>  
    )
}