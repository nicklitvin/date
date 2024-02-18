import { observer } from "mobx-react-lite";
import { StyledText, StyledView } from "../styledElements";
import { matchesText } from "../text";
import { ChatPreview, PublicProfile } from "../interfaces";
import { Image } from "expo-image";

interface Props {
    newMatches: PublicProfile[]
    chatPreviews: ChatPreview[]
}

export function Matches(props : Props) {
    return (
        <StyledView>
            <StyledText>
                {`${matchesText.newMatches}`}
            </StyledText>
            {props.newMatches.map( (match, index) => (
                <Image
                    key={`${match.id}-${index}`}
                    source={match.images[0]}
                />
            ))}
            <StyledText>
                {`${matchesText.chats}`}
            </StyledText>
            {/* {props.chatPreviews.map( (match,index) => (

            ))} */}
        </StyledView>
    )
} 

export const MatchesPop = observer(Matches);

