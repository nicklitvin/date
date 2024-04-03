import classNames from "classnames";
import { StyledButton, StyledImage, StyledText, StyledView } from "../styledElements";

type pageType = "Pictures" | "Attributes" | "Keyboard"

interface Props {
    title: string
    subtitle: string
    beforeGapContent?: any
    content?: any
    pageType?: pageType
    goBackFunc?: () => any
}

export function MySimplePage(props : Props) {
    return (
        <StyledView className="flex-grow bg-back">
            {props.goBackFunc ? 
                <StyledButton 
                    className="absolute left-5 top-0"
                    onPress={props.goBackFunc}
                >
                    <StyledImage
                        source={require("../../assets/Back.png")}
                        className="w-[35px] h-[35px]"
                    />
                </StyledButton> : null
            }
            
            <StyledView className={classNames(
                "flex flex-col items-center p-5",
                props.pageType == "Attributes" ? "h-[700px]" : (
                    props.pageType == "Pictures" ? "mt-[50px] h-[700px]" : (
                        props.pageType == "Keyboard" ? "mt-[200px] h-[200px]" :
                            "mt-[200px] h-[400px]"
                    )
                )
            )}>
                <StyledText className={`text-3xl font-bold text-center mb-5`}>
                    {props.title}
                </StyledText>
                <StyledText className={`text-xl text-center mb-5`}>
                    {props.subtitle}
                </StyledText>
                {props.beforeGapContent}
                <StyledView className="flex-grow w-full">
                </StyledView>
                {props.content}
            </StyledView>
        </StyledView>
    )
}