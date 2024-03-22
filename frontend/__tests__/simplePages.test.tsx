import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { FileUploadAndURI } from "../src/interfaces";
import { birthdayText, genderText, generalText, pictureText } from "../src/text";
import { globals } from "../src/globals";
import { Attributes } from "../src/pages/Attributes";
import { Gender } from "../src/simplePages/Gender";
import { Birthday } from "../src/simplePages/Birthday";
import { GenderPreference } from "../src/simplePages/GenderPreference";
import { Pictures } from "../src/simplePages/Pictures";

describe("test pages", () => {
    it("should not continue if not enough upload", async () => {
        const onSubmit = jest.fn();
        render(
            <Pictures
                onSubmit={onSubmit}
                submitText={generalText.continue}
                uploads={[]}
            />
        );

        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press");
        })

        expect(onSubmit).toHaveBeenCalledTimes(0);
    })

    it("should switch images", async () => {
        const imageURI = "a";
        const imageURI_2 = "b";
        const uploads : FileUploadAndURI[] = [
            {
                buffer: Buffer.from("a"),
                mimetype: "image/jpeg",
                uri: imageURI
            },
            {
                buffer: Buffer.from("b"),
                mimetype: "image/jpeg",
                uri: imageURI_2
            }
        ]
        const onSubmit = jest.fn((input : FileUploadAndURI[]) => 
            input.reduce( (prev : string, curr : FileUploadAndURI) => {
                return prev + curr.uri
            }, "")
        );

        render(
            <Pictures
                onSubmit={onSubmit}
                submitText={generalText.continue}
                uploads={uploads}
            />
        );

        await act( () => {
            fireEvent(screen.getByTestId(`picture-${imageURI}`), "press");
        })
        await act( () => {
            fireEvent(screen.getByTestId(`picture-${imageURI_2}`), "press");
        })
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
        expect(onSubmit).toHaveLastReturnedWith(`${imageURI_2}${imageURI}`)
    })

    it("should remove picture", async () => {
        const imageURI = "a";
        const imageURI_2 = "b";
        const uploads : FileUploadAndURI[] = [
            {
                buffer: Buffer.from("a"),
                mimetype: "image/jpeg",
                uri: imageURI
            },
            {
                buffer: Buffer.from("b"),
                mimetype: "image/jpeg",
                uri: imageURI_2
            }
        ]
        const onSubmit = jest.fn();
        const returnUploadLength = jest.fn( (input : number) => input);

        render(
            <Pictures
                onSubmit={onSubmit}
                submitText={generalText.continue}
                uploads={uploads}
                returnUploadLength={returnUploadLength}
            />
        );

        await act( () => {
            fireEvent(screen.getByTestId(`remove-${imageURI}`), "press");
        })
        
        expect(returnUploadLength).toHaveLastReturnedWith(1);
    })

    // it("should remove switchURI if removed picture", async () => {
    //     const imageURI = "a";
    //     const imageURI_2 = "b";
    //     const uploads : FileUploadAndURI[] = [
    //         {
    //             buffer: Buffer.from("a"),
    //             mimetype: "image/jpeg",
    //             uri: imageURI
    //         },
    //         {
    //             buffer: Buffer.from("b"),
    //             mimetype: "image/jpeg",
    //             uri: imageURI_2
    //         }
    //     ]
    //     const onSubmit = jest.fn();
    //     const returnSwitchURI = jest.fn( (input : string|null) => input)

    //     render(
    //         <Pictures
    //             onSubmit={onSubmit}
    //             submitText={generalText.continue}
    //             uploads={uploads}
    //             returnSwitchURI={returnSwitchURI}
    //         />
    //     );

    //     await act( () => {
    //         fireEvent(screen.getByTestId(`picture-${imageURI}`), "press");
    //     })

    //     expect(returnSwitchURI).toHaveLastReturnedWith(imageURI);

    //     await act( () => {
    //         fireEvent(screen.getByTestId(`remove-${imageURI}`), "press");
    //     })
        
    //     expect(returnSwitchURI).toHaveLastReturnedWith(null);
    // })

    it("should generate all attributes", async () => {
        render(
            <Attributes
                attributes={globals.attributes}
                onSubmit={jest.fn()}
                submitText="submit"
            />
        );

        for (const entry of Object.entries(globals.attributes)) {
            expect(screen.queryByText(entry[0])).not.toEqual(null);
            for (const attribute of entry[1]) {
                expect(screen.queryByText(attribute.value)).not.toEqual(null);
            }
        }
    })

    it("should not continue if gender not selected", async () => {
        const onSubmit = jest.fn();
        render(
            <Gender
                genders={globals.genders}
                onSubmit={onSubmit}
                submitText={generalText.continue}  
            />
        );

        expect(screen.queryByText(genderText.pageTitle)).not.toEqual(null);
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press");
        })

        expect(onSubmit).toHaveBeenCalledTimes(0);
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

    it("should unselect gender", async () => {
        const onSubmit = jest.fn();
        render(
            <Gender
                genders={globals.genders}
                onSubmit={onSubmit}
                submitText={generalText.continue}
            />
        );

        const genderButton = screen.getByText(globals.genders[0]);
        await act( () => {
            fireEvent(genderButton, "press")
        })
        await act( () => {
            fireEvent(genderButton, "press")
        })
        await act( () => {
            fireEvent(screen.getByText(generalText.continue), "press")
        })
    
        expect(onSubmit).toHaveBeenCalledTimes(0);
    })
})