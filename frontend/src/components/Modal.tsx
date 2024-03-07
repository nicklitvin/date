import classNames from "classnames";
import { StyledButton, StyledModal, StyledText, StyledView } from "../styledElements";
import { MyButton } from "./Button";
import { createContext, useState } from "react";

interface ModalButton {
    text: string
    function : () => any
    danger: boolean
}

interface Props {
    show: boolean
    text: string
    buttons: ModalButton[]
    cancelButtonIndex?: number
}

export function MyModal(props : Props) {
    return (
        <StyledModal
            animationType="fade"
            visible={props.show}
            transparent={true}
            statusBarTranslucent={true}
            onRequestClose={
                props.cancelButtonIndex ? 
                props.buttons[props.cancelButtonIndex].function : 
                ()=>{}
            }
        >
            <StyledView className="absolute opacity-50 bg-front w-full h-full"/>
            <StyledView className="flex w-full h-full items-center justify-center">
                <StyledView className="bg-front w-3/5 rounded-3xl">
                    <StyledText className="font-bold text-base text-center text-back p-5">
                        {props.text}
                    </StyledText>
                    {props.buttons.map( button => (
                        <StyledButton 
                            key={`modal-button-${button.text}`}
                            className="border-back p-3 border-t-[0.5px]"
                            onPress={button.function}
                        >
                            <StyledText className={classNames(
                                "w-full text-center font-bold text-base",
                                button.danger ? "text-danger" : "text-back"
                            )}>
                                {button.text}
                            </StyledText>
                        </StyledButton>
                    ))}
                </StyledView>
            </StyledView>
        </StyledModal>
    )
}
