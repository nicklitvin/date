import { Image } from "expo-image"
import { StyledText, StyledView } from "../styledElements"

interface Props {
    title: string
    imageSource: string
    rightContent?: React.JSX.Element
    swapTitleAndImage? : boolean
}
export function PageHeader(props : Props) {
    return (
        <StyledView>
            {
            props.swapTitleAndImage ?
            <>
                <Image source={props.imageSource}/>
                <StyledText>
                    {props.title}
                </StyledText>
            </> :
            <>
                <StyledText>
                    {props.title}
                </StyledText>
                <Image source={props.imageSource}/>
            </>
            }
            {props.rightContent}
        </StyledView>
    )
}