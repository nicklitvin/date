import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { MyButton } from "../src/components/Button";
import { MyInput } from "../src/components/Input";

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

    it("should submit myInput correctly", async () => {
        const placeholder = "placeholder";
        const errorMessage = "error";
        const afterSubmit = jest.fn();
        const saveMessage = jest.fn();

        const typedMessage = "message";

        render(
            <MyInput 
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
            <MyInput 
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
})