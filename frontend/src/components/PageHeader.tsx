import { Link } from "expo-router";
import { StyledImage, StyledText, StyledView } from "../styledElements"

type ImageName = "SendTriangle" | "Matches" | "Preferences" | "Stats" | "Profile" | "Settings" | "Edit" | "Telescope" | "Feed";

interface Props {
    title: string
    imageSource?: string
    rightContent?: React.JSX.Element
    swapTitleAndImage? : boolean
    imageType?: ImageName
    imageLink?: string
}

export function PageHeader(props : Props) {
    const SendTriangle = require(`../../assets/SendTriangle.png`);
    const MatchesBubble = require(`../../assets/Matches.png`);
    const Preferences = require("../../assets/Preferences.png");
    const Stats = require("../../assets/Stats.png");
    const Profile = require("../../assets/Profile.png");
    const Settings = require("../../assets/Setting.png");
    const Edit = require("../../assets/Edit.png");
    const Telesceope = require("../../assets/Telescope.png");
    const Feed = require("../../assets/Feed.png");

    let imageData;
    switch (props.imageType) {
        case ("SendTriangle"): imageData = SendTriangle; break;
        case ("Matches"): imageData = MatchesBubble; break;
        case ("Preferences"): imageData = Preferences; break;
        case ("Stats"): imageData = Stats; break;
        case ("Profile"): imageData = Profile; break;
        case ("Settings"): imageData = Settings; break; 
        case ("Edit"): imageData = Edit; break;
        case ("Telescope"): imageData = Telesceope; break;
        case ("Feed"): imageData = Feed; break;
    }

    let imageElement = props.imageSource ? 
        <StyledImage 
            className="w-[50px] h-[50px] rounded-full"
            alt=""
            source={{uri : props.imageSource}}
        /> : 
        <StyledImage 
            className="w-[25px] h-[25px]"
            source={imageData}
        />;

    if (props.imageLink) {
        imageElement = (
            <Link 
                href={props.imageLink} 
            >
                <StyledView className="w-[50px] h-[50px] flex items-center justify-center">
                    {imageElement}
                </StyledView>
            </Link>
        )
    }
        
    const textElement = <StyledText className="text-3xl font-bold">
        {props.title}
    </StyledText>
    const middle = <StyledView className="w-3"/>

    return (
        <StyledView className="w-full flex flex-row items-center py-2 px-5">
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