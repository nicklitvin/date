import { Image } from "expo-image";
import { StyledButton, StyledView } from "../styledElements";
import classNames from "classnames";

interface Props {
    switching: boolean
    source: string
    onRemove: () => any
    onPress: () => any
}

export function Picture(props : Props) {
    return (
        <StyledView 
            testID={`picture-${props.source}`}
            className={classNames(props.switching ? "" : "")}>
            <StyledButton
                onPress={props.onPress}
            >
                <Image
                    source={props.source}
                />
                <StyledButton
                    testID={`remove-${props.source}`}
                    onPress={props.onRemove}
                />
            </StyledButton>
        </StyledView>
    )
}