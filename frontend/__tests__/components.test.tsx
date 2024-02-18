import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { MyButton } from "../src/components/Button";
import { MyTextInput } from "../src/components/TextInput";
import { MyDateInput } from "../src/components/DateInput";
import { accountCreationText } from "../src/text";
import { ChatPreviewBox } from "../src/components/ChatPreviewBox";
import { ChatPreview } from "../src/interfaces";
import { otherProfile, receivedMessage, sentMessage } from "../__testUtils__/easySetup";

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
        const afterSubmit = jest.fn();
        const saveMessage = jest.fn();

        const typedMessage = "message";

        render(
            <MyTextInput 
                placeholder={placeholder}
                afterSubmit={afterSubmit}
                errorMessage={errorMessage}
                saveMessage={saveMessage}
            />
        );

        const input = screen.getByPlaceholderText(placeholder);
        await act( () => {
            fireEvent(input, "changeText", typedMessage)
        });

        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(afterSubmit).toHaveBeenCalledTimes(1);
        expect(saveMessage).toHaveBeenCalledWith(typedMessage);
    })

    it("should show error when bad submit", async () => {
        const placeholder = "placeholder";
        const errorMessage = "error";
        const afterSubmit = jest.fn();
        const saveMessage = jest.fn();

        render(
            <MyTextInput 
                placeholder={placeholder}
                afterSubmit={afterSubmit}
                errorMessage={errorMessage}
                saveMessage={saveMessage}
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
        const afterSubmit = jest.fn();
        const saveDate = jest.fn();

        render(<MyDateInput afterSubmit={afterSubmit} saveDate={saveDate} 
            customDate={new Date()}
        />);
        expect(screen.queryByText(accountCreationText.birthdayInputError)).not.toEqual(null);
    })

    it("should submit myDateInput", async () => {
        const afterSubmit = jest.fn();
        const saveDate = jest.fn();
        const chosenDate = new Date(2000,0,1);

        render(<MyDateInput afterSubmit={afterSubmit} saveDate={saveDate} 
            customDate={chosenDate}
        />);
        const continueButton = screen.getByText(accountCreationText.continue);
        await act( () => {
            fireEvent(continueButton, "press");
        });

        expect(afterSubmit).toHaveBeenCalledTimes(1);
        expect(saveDate).toHaveBeenCalledWith(chosenDate)
    })

    it("should show all chatpreviewbox components", async () => {
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
        const lastMessage = receivedMessage;
        lastMessage.readStatus = false;

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            messages: [lastMessage, sentMessage]
        }

        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.getByTestId(`unread-${otherProfile.id}`)).not.toEqual(null);
    })

    it("should not show notification dot if read", async () => {
        const lastMessage = receivedMessage;
        lastMessage.readStatus = true;

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            messages: [lastMessage, sentMessage]
        }

        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.queryByTestId(`unread-${otherProfile.id}`)).toEqual(null);
    })

    it("should not show notification dot if other unread", async () => {
        const lastMessage = sentMessage;
        lastMessage.readStatus = false;

        const chatPreview : ChatPreview = {
            profile: otherProfile,
            messages: [lastMessage, sentMessage]
        }

        render(
            <ChatPreviewBox
                chatPreview={chatPreview}
            />
        )

        expect(screen.queryByTestId(`unread-${otherProfile.id}`)).toEqual(null);
    })
})