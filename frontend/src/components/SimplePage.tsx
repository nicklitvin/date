import classNames from "classnames";
import { StyledText, StyledView } from "../styledElements";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";

type pageType = "Pictures" | "Attributes" | "Keyboard"

interface Props {
    title: string
    subtitle: string
    beforeGapContent?: any
    content?: any
    marginTop?: pageType
}

export function MySimplePage(props : Props) {
    return (
        <TouchableWithoutFeedback 
            onPress={Keyboard.dismiss}
        >
            <StyledView className="flex-grow">
                <StyledView className={classNames(
                    "flex flex-col items-center",
                    props.marginTop == "Attributes" ? "" : (
                        props.marginTop == "Pictures" ? "mt-[100px] h-[600px]" : (
                            props.marginTop == "Keyboard" ? "mt-[200px] h-[200px]" :
                                "mt-[200px] h-[400px]"
                        )
                    ) ,
                )}>
                    <StyledText className={`text-3xl font-bold text-center mb-5`}>
                        {props.title}
                    </StyledText>
                    <StyledText className={`text-xl text-center mb-5`}>
                        {props.subtitle}
                    </StyledText>
                    {props.beforeGapContent}
                    <StyledView className="flex-grow bg-red-500 w-full">
                    </StyledView>
                    {props.content}
                </StyledView>
            </StyledView>
        </TouchableWithoutFeedback>
    )
}