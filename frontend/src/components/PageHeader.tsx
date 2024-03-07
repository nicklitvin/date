import { Image } from "expo-image"
import { StyledImage, StyledText, StyledView } from "../styledElements"

type ImageName = "SendTriangle";

interface Props {
    title: string
    imageSource?: string
    rightContent?: React.JSX.Element
    swapTitleAndImage? : boolean
    imageType?: ImageName
}

export function PageHeader(props : Props) {
    const SendTriangle = require(`../../assets/SendTriangle.png`);

    let imageData;
    switch (props.imageType) {
        case ("SendTriangle"): imageData = SendTriangle; break;
    }

    const imageElement = props.imageSource ? 
        <StyledImage 
            className="w-[50px] h-[50px] rounded-full"
            source={{uri : props.imageSource}}
        /> : 
        <StyledImage 
            className="w-[25px] h-[25px]"
            source={imageData}
        />
        
    const textElement = <StyledText className="text-3xl font-bold">
        {props.title}
    </StyledText>
    const middle = <StyledView className="w-3"/>

    return (
        <StyledView className="w-full flex flex-row items-center border-b py-2 px-5">
            {
            props.swapTitleAndImage ?
            <>
                {imageElement}
                {middle}
                {textElement}
            </> :
            <>
                {textElement}
                {middle}
                {imageElement}
            </>
            }
            <StyledView className="flex-grow"/>
            {props.rightContent}
        </StyledView>
    )
}