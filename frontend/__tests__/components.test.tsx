import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { MyButton } from "../src/components/Button";
import { MyTextInput } from "../src/components/TextInput";
import { ChatPreviewBox } from "../src/components/ChatPreviewBox";
import { ChatPreview } from "../src/interfaces";
import { makePublicProfile, makeReceivedMessage, makeSentMessage } from "../__testUtils__/easySetup";

describe("components", () => {
    it("should call myButton function", async () => {
        const func = jest.fn();
        const text = "text";

        expect(func).toHaveBeenCalledTimes(0);

        render(<MyButton text={text} onPressFunction={func}/>);
        const button = screen.getByText(text);
        await act( () => {
            fireEvent(button, "press")
        });

        expect(func).toHaveBeenCalledTimes(1);
    })

    // it("should submit myInput", async () => {
    //     const placeholder = "placeholder";
    //     const onSubmit = jest.fn( (input : string) => input);
    //     const typedMessage = "message";

    //     render(
    //         <MyTextInput 
    //             placeholder={placeholder}
    //             onSubmit={onSubmit}
    //         />
    //     );

    //     const input = screen.getByPlaceholderText(placeholder);
    //     await act( () => {
    //         fireEvent(input, "changeText", typedMessage)
    //     });

    //     await act( () => {
    //         fireEvent(input, "submitEditing");
    //     })

    //     expect(onSubmit).toHaveBeenCalledTimes(1);
    //     expect(onSubmit).toHaveBeenCalledWith(typedMessage);
    // })

    it("should show all chatpreviewbox components", async () => {
        const otherProfile = makePublicProfile();
        const sentMessage = makeSentMessage();
        const receivedMessage = makeReceivedMessage();

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            message: sentMessage
        }
        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.queryByText(otherProfile.name)).not.toEqual(null);
        expect(screen.queryByText(`You: ${sentMessage.message}`)).not.toEqual(null);
    })

    it("should show notification dot", async () => {
        const otherProfile = makePublicProfile();
        const receivedMessage = makeReceivedMessage();
        receivedMessage.readStatus = false;

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            message: receivedMessage
        }

        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.getByTestId(`unread-${otherProfile.id}`)).not.toEqual(null);
    })

    it("should not show notification dot if read", async () => {
        const otherProfile = makePublicProfile();
        const receivedMessage = makeReceivedMessage();
        receivedMessage.readStatus = true;

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            message: receivedMessage
        }

        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.queryByTestId(`unread-${otherProfile.id}`)).toEqual(null);
    })

    it("should not show notification dot if other unread", async () => {
        const otherProfile = makePublicProfile();
        const sentMessage = makeSentMessage();
        sentMessage.readStatus = false;

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            message: sentMessage
        }

        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.queryByTestId(`unread-${otherProfile.id}`)).toEqual(null);
    })
})