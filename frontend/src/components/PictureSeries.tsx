import { useEffect, useState } from "react"
import { StyledButton, StyledImage, StyledView } from "../styledElements";
import { Dimensions } from "react-native";
import { MyButton } from "./Button";
import { Action } from "../types";
import { testIDS } from "../testIDs";

interface Props {
    imageURLs: string[]
    swipable?: boolean
    swipeFunction?: (opinion : Action) => any
}

export function PictureSeries(props : Props) {
    const [index, setIndex] = useState<number>(0);

    const width = Dimensions.get("screen").width;
    const height = width * 4/3;

    return (
        <StyledView className="w-full ">
            <StyledImage
                style={{width: width, height: height}}
                source={props.imageURLs[index]}
            />
            <StyledButton
                className="left-0 w-1/2 h-full absolute"
                onPress={ () => setIndex( (index - 1 + props.imageURLs.length) % props.imageURLs.length )}
            />
            <StyledButton
                className="left-1/2 w-1/2 h-full absolute"
                onPress={ () => setIndex( (index + 1 + props.imageURLs.length) % props.imageURLs.length )}
            />
            {
                props.swipable ?
                <>
                    <StyledButton 
                        className="bottom-0 right-0 absolute" 
                        onPress={() => props.swipeFunction!("Like")}
                        testID={testIDS.swipeLike}
                        key={testIDS.swipeLike}
                    >
                        <StyledImage
                            className="w-20 h-20"
                            source={require("../../assets/Like.png")}
                        />
                    </StyledButton>
                    <StyledButton 
                        className="bottom-0 left-0 absolute" 
                        onPress={() => props.swipeFunction!("Dislike")}
                        testID={testIDS.swipeDislike}
                        key={testIDS.swipeDislike}
                    >
                        <StyledImage
                            className="w-20 h-20"
                            source={require("../../assets/Dislike.png")}
                        />
                    </StyledButton>
                </> : null
            }
        </StyledView>
    )
}