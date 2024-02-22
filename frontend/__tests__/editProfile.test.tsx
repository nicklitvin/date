import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { EditProfile } from "../src/pages/EditProfile";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { URLs } from "../src/urls";
import { DeleteImageInput, EditUserInput, UploadImageInput } from "../src/interfaces";
import { globals } from "../src/globals";
import { editProfileText } from "../src/text";

describe("editProfile", () => {
    const description = "description";
    const uploadURLs = ["url_1", "url_2"];
    const attributes = ["attribute_1", "attribute_2"];

    it("should remove image", async () => {
        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.deleteImage).reply( config => {
            const payload = JSON.parse(config.data) as DeleteImageInput;
            expect(payload.imageID).toEqual(uploadURLs[0]);
            return [200]
        })

        const func = jest.fn( (input : number) => input);
        render(<EditProfile
            attributes={attributes}
            uploadURLs={uploadURLs}
            returnUploadURLsLength={func}
            description={description}
        />)

        expect(func).toHaveLastReturnedWith(2);

        await act( () => {
            fireEvent(screen.getByTestId(`remove-${uploadURLs[0]}`), "press")
        })

        expect(func).toHaveLastReturnedWith(1);
    })

    it("should switch image", async () => {
        let sent = false;

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.newOrder).reply( config => {
            const payload = JSON.parse(config.data) as EditUserInput;
            expect(payload.setting).toEqual(globals.settingImages);
            expect(payload.value[0]).toEqual(uploadURLs[1]);
            expect(payload.value[1]).toEqual(uploadURLs[0]);
            sent = true;
            return [200]
        });

        render(<EditProfile
            attributes={attributes}
            uploadURLs={uploadURLs}
            description={description}
        />)

        await act( () => {
            fireEvent(screen.getByTestId(`picture-${uploadURLs[0]}`), "press");
        })
        await act( () => {
            fireEvent(screen.getByTestId(`picture-${uploadURLs[1]}`), "press");
        })

        expect(sent).toEqual(true);
    })

    it("should upload image", async () => {
        let sent = false;
        const mimetype = "image/jpeg";

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.uploadImage).reply( config => {
            const payload = JSON.parse(config.data) as UploadImageInput;
            expect(payload.image.buffer).not.toEqual(null);
            expect(payload.image.mimetype).toEqual(mimetype);
            sent = true;
            return [200]
        })

        render(
            <EditProfile
                attributes={attributes}
                description={description}
                uploadURLs={[]}
                uploadImageData={{
                    buffer: Buffer.from("1"),
                    mimetype: mimetype,
                    uri: "1"
                }}
            />
        );

        await act( () => {
            fireEvent(screen.getByTestId(`edit-empty-3`),"press");
        })

        expect(sent).toEqual(true);
    })

    it("should edit description", async () => {
        const newDescription = "newDescription";

        const mock = new MockAdapter(axios);
        mock.onPost(URLs.server + URLs.editUser).reply( config => {
            const payload = JSON.parse(config.data) as EditUserInput;
            expect(payload.setting).toEqual(globals.settingDescription);
            expect(payload.value).toEqual(newDescription);
            return [200]
        })

        const func = jest.fn( (input : string) => input);
        render(<EditProfile
            attributes={attributes}
            description={description}
            uploadURLs={[]}
            returnDescription={func}
        />)

        const input = screen.getByPlaceholderText(editProfileText.descriptionPlaceholder);
        await act( () => {
            fireEvent(input, "changeText", newDescription);
        })
        await act( () => {
            fireEvent(input, "submitEditing");
        })

        expect(func).toHaveLastReturnedWith(newDescription);
    })
})