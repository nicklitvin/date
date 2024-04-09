import { globals } from "../globals";
import { ChatPreview } from "../interfaces";
import { StyledButton, StyledImage, StyledText, StyledView } from "../styledElements";

interface Props {
    chatPreview: ChatPreview
    onPress?: () => any
}

export function ChatPreviewBox(props : Props) {
    const getBriefSummaryText = () => {
        const lastMessage = props.chatPreview.message;
        let returnedMessage : string;
        if (lastMessage?.recepientID == props.chatPreview.profile.id) {
            returnedMessage = `You: ${lastMessage.message}`
        } else {
            returnedMessage = `${lastMessage?.message}`
        }

        if (returnedMessage.length > globals.maxPreviewMessageLength) {
            returnedMessage = returnedMessage.slice(0,globals.maxPreviewMessageLength) + "..."
        }

        return returnedMessage
    }

    const isNewUnread = () => {
        const lastMessage = props.chatPreview.message;

        return (lastMessage?.userID == props.chatPreview.profile.id 
            && lastMessage.readStatus == false) 
    }

    return (
        <StyledButton
            className="rounded-3xl border border-front px-5 py-5 flex flex-row w-full items-center"
            onPress={props.onPress}
            // style={{
            //     // IOS
            //     shadowColor: 'rgba(0,0,0, .4)', 
            //     shadowOffset: { height: 1, width: 1 }, 
            //     shadowOpacity: 1, 
            //     shadowRadius: 1, 
            //     // Android
            //     elevation: 5
            // }}
        >
            <StyledImage
                className="w-[70px] h-[70px] rounded-full"
                source={props.chatPreview.profile.images[0].url}
            />
            <StyledView className="ml-3 flex flex-col justify-center flex-1">
                <StyledView className="flex w-full flex-row items-center">
                    <StyledText className="font-bold text-lg">
                        {props.chatPreview.profile.name}
                    </StyledText>
                    <StyledView className="flex-grow bg-white"/>
                    {
                        isNewUnread() ? 
                        <StyledView 
                            className="bg-front w-[20px] h-[20px] rounded-full absolute right-0"
                            testID={`unread-${props.chatPreview.profile.id}`}
                        /> :
                        null
                    }
                </StyledView>
                <StyledText className="text-lg">
                    {getBriefSummaryText()}
                </StyledText>
            </StyledView>
        </StyledButton>
    )
}