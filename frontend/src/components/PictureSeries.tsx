import { useEffect, useState } from "react"
import { StyledButton, StyledImage, StyledView } from "../styledElements";
import { Dimensions } from "react-native";
import { MyButton } from "./Button";
import { testIDS } from "../testIDs";
import classNames from "classnames";

interface Props {
    imageURLs: string[]
    swipable?: boolean
    swipeFunction?: (opinion : any) => any
}

export function PictureSeries(props : Props) {
    const [index, setIndex] = useState<number>(0);

    const width = Dimensions.get("screen").width;
    const height = width * 4/3;

    return (
        <StyledView className="w-full">
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
            <StyledView 
                className="bottom-0 absolute w-full h-20 flex justify-center items-center flex-row"
            >
                {
                    props.imageURLs.map( (val,picIndex) => 
                        <StyledView
                            key={`${val}-${picIndex}`}
                            className={classNames(
                                picIndex == index ? "bg-back opacity-80" : "opacity-80 bg-front",
                                "w-3 h-3 rounded-full mx-2"
                            )}
                        />
                    )   
                }
            </StyledView>
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