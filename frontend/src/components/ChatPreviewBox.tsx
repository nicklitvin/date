import { ChatPreview } from "../interfaces";
import { StyledText, StyledView } from "../styledElements";
import { Image } from "expo-image";

interface Props {
    chatPreview: ChatPreview
}

export function ChatPreviewBox(props : Props) {
    const getBriefSummaryText = () => {
        const lastMessage = props.chatPreview.messages[0];

        if (lastMessage?.recepientID == props.chatPreview.profile.id) {
            return `You: ${lastMessage.message}`
        } else {
            return `${lastMessage?.message}`
        }
    }

    const isNewUnread = () => {
        const lastMessage = props.chatPreview.messages[0];

        return (lastMessage?.userID == props.chatPreview.profile.id 
            && lastMessage.readStatus == false) 
    }

    return (
        <StyledView>
            <Image
                source={props.chatPreview.profile.images[0]}
            />
            <StyledText>
                {props.chatPreview.profile.name}
            </StyledText>
            <StyledText>
                {getBriefSummaryText()}
            </StyledText>
            {
                isNewUnread() ? 
                <StyledView testID={`unread-${props.chatPreview.profile.id}`}/> :
                null
            }
        </StyledView>
    )
}