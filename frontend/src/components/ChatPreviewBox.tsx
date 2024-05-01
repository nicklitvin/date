import { globals } from "../globals";
import { ChatPreview } from "../interfaces";
import { StyledButton, StyledImage, StyledText, StyledView } from "../styledElements";
import { makeBriefSummaryText } from "../utils";

interface Props {
    chatPreview: ChatPreview
    onPress?: () => any
}

export function ChatPreviewBox(props : Props) {
    const getBriefSummaryText = () => {
        const isMyMessage = props.chatPreview.message?.recepientID == props.chatPreview.profile.id;
        return makeBriefSummaryText(props.chatPreview.message.message, isMyMessage)
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
                source={props.chatPreview.profile.images[0]?.url}
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