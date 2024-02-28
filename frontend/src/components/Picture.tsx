import { Image } from "expo-image";
import { StyledButton, StyledImage, StyledView } from "../styledElements";
import classNames from "classnames";

interface Props {
    switching: boolean
    source: string
    onRemove: () => any
    onPress: () => any
}

export function Picture(props : Props) {
    return props.switching ?
    
    <StyledView 
        testID={`picture-${props.source}`}
    >
        <StyledButton
            className="flex justify-start items-start w-[102px] h-[136px]"
            onPress={props.onPress}
        >
            <StyledImage
                className="w-[102px] h-[136px] rounded-xl"
                style={{
                    opacity: 0.5
                }}
                source={props.source}
            />
            <StyledImage
                className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-[24px] -translate-y-[24px] "
                source={require("../../assets/Switch.png")}
            />
        </StyledButton>
    </StyledView> :

    <StyledView 
        className="flex justify-start items-start w-[102px] h-[136px]"
        testID={`picture-${props.source}`}
    >
        <StyledButton
            onPress={props.onPress}
        >
            <StyledImage
                className="w-[102px] h-[136px] rounded-xl"
                source={props.source}
            />
        </StyledButton>
        <StyledButton
            className="absolute right-[-10px] top-[-10px]"
            testID={`remove-${props.source}`}
            onPress={props.onRemove}
        >
            <StyledImage
                source={require("../../assets/Dislike.png")}
                className="w-8 h-8"
            />
        </StyledButton>
    </StyledView>
}