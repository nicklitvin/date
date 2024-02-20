import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { MyButton } from "../src/components/Button";
import { MyTextInput } from "../src/components/TextInput";
import { accountCreationText, birthdayText, generalText } from "../src/text";
import { ChatPreviewBox } from "../src/components/ChatPreviewBox";
import { ChatPreview } from "../src/interfaces";
import { makePublicProfile, makeReceivedMessage, makeSentMessage } from "../__testUtils__/easySetup";
import { Birthday } from "../src/simplePages/Birthday";

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

    it("should submit myInput", async () => {
        const placeholder = "placeholder";
        const errorMessage = "error";
        const onSubmit = jest.fn( (input : string) => input);
        const typedMessage = "message";

        render(
            <MyTextInput 
                placeholder={placeholder}
                errorMessage={errorMessage}
                onSubmit={onSubmit}
            />
        );

        const input = screen.getByPlaceholderText(placeholder);
        await act( () => {
            fireEvent(input, "changeText", typedMessage)
        });

        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(typedMessage);
    })

    it("should show error when bad submit", async () => {
        const placeholder = "placeholder";
        const errorMessage = "error";
        const onSubmit = jest.fn( (input : string) => input);

        render(
            <MyTextInput 
                placeholder={placeholder}
                errorMessage={errorMessage}
                onSubmit={onSubmit}
            />
        );
        
        const input = screen.getByPlaceholderText(placeholder); 
        expect(screen.queryByText(errorMessage)).toEqual(null);

        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(screen.queryByText(errorMessage)).not.toEqual(null);
    })

    it("should show error when bad date input", async () => {
        const onSubmit = jest.fn( (input : Date) => input);

        render(<Birthday
            submitText={generalText.continue}
            onSubmit={onSubmit}
            customBirthday={new Date()}
        />)

        expect(screen.queryByText(birthdayText.inputError)).not.toEqual(null);
    })

    it("should submit myDateInput", async () => {
        const onSubmit = jest.fn( (input : Date) => input);
        const chosenDate = new Date(2000,0,1);

        render(<Birthday
            submitText={generalText.continue}
            onSubmit={onSubmit}
            customBirthday={chosenDate}
        />)

        const continueButton = screen.getByText(generalText.continue);
        await act( () => {
            fireEvent(continueButton, "press");
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveLastReturnedWith(chosenDate)
    })

    it("should show all chatpreviewbox components", async () => {
        const otherProfile = makePublicProfile();
        const sentMessage = makeSentMessage();
        const receivedMessage = makeReceivedMessage();

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            messages: [sentMessage, receivedMessage]
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
            messages: [receivedMessage]
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
            messages: [receivedMessage]
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
            messages: [sentMessage]
        }

        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.queryByTestId(`unread-${otherProfile.id}`)).toEqual(null);
    })
})