import { observer } from "mobx-react-lite";
import { PageHeader } from "../components/PageHeader";
import { editProfileText } from "../text";
import { useEffect, useState } from "react";
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { globals } from "../globals";
import { Picture } from "../components/Picture";
import axios from "axios";
import { DeleteImageInput, EditUserInput, FileUploadAndURI, UploadImageInput } from "../interfaces";
import { URLs } from "../urls";
import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import { EncodingType, readAsStringAsync } from "expo-file-system";
import { MyTextInput } from "../components/TextInput";
import { MyButton } from "../components/Button";

interface Props {
    uploadURLs: string[]
    description: string
    attributes: string[]
    uploadImageData?: FileUploadAndURI
    returnUploadURLsLength?: (input : number) => number
    returnDescription?: (input : string) => string
    returnAttributeLength?: (input : number) => number
}

export function EditProfile(props : Props) {
    const [uploadURLs, setUploadURLs] = useState<string[]>(props.uploadURLs);
    const [switchURL, setSwitchURL] = useState<string|null>(null);
    const [description, setDescription] = useState<string>(props.description);
    const [attributes, setAttributes] = useState<string[]>(props.attributes);

    useEffect( () => {
        if (props.returnUploadURLsLength) props.returnUploadURLsLength(uploadURLs.length);
    }, [uploadURLs])

    useEffect( () => {
        if (props.returnDescription) props.returnDescription(description);
    })

    useEffect( () => {
        if (props.returnAttributeLength) props.returnAttributeLength(attributes.length);
    })

    const removeImage = async (url : string) => {
        try {
            const input : DeleteImageInput = {
                imageID: url
            }
            await axios.post(URLs.server + URLs.deleteImage, input);
            setUploadURLs([...uploadURLs].filter(val => val != url));
        } catch (err) {

        }
    }

    const switchImage = async (url : string) => {
        if (switchURL == url) {
            setSwitchURL(null)
        } else if (switchURL) {
            const copy = [...uploadURLs];
            const index1 = copy.findIndex( val => val == url);
            const index2 = copy.findIndex( val => val == switchURL);
            const saved = copy[index1];
            copy[index1] = copy[index2];
            copy[index2] = saved;
            try {
                const input : EditUserInput = {
                    setting: globals.settingImages,
                    value: copy
                }
                await axios.post(URLs.server + URLs.newOrder, input);
                setUploadURLs(copy);
                setSwitchURL(null);
            } catch (err) {

            }
        } else {
            setSwitchURL(url);
        }
    }

    const uploadImage = async () => {
        try {
            let file : FileUploadAndURI;

            if (props.uploadImageData) file = props.uploadImageData;
            else {
                const result = await launchImageLibraryAsync({
                    mediaTypes: MediaTypeOptions.Images,
                    selectionLimit: 1
                });
        
                if (result.canceled) return
    
                const assetString = await readAsStringAsync(result.assets[0].uri, {
                    encoding: EncodingType.Base64
                })
                const buffer = Buffer.from(assetString);
                
                file = {
                    buffer: buffer,
                    uri: result.assets[0].uri,
                    mimetype: result.assets[0].mimeType!
                }
            }            

            const input : UploadImageInput = {
                image: file
            }

            const response = await axios.post(URLs.server + URLs.uploadImage, input);
            setUploadURLs([...uploadURLs, response.data.data])
        } catch (err) {

        }
    }

    const editDescription = async (description : string) => {
        try {
            const input : EditUserInput = {
                setting: globals.settingDescription,
                value: description
            }
            const response = await axios.post(URLs.server + URLs.editUser, input);
            setDescription(description);
        } catch (err) {

        }
    }

    const editAttributes = () => {

    }

    return (
        <>
            <PageHeader
                title={editProfileText.pageTitle}
                imageSource=""
            />
            <StyledView>
                <StyledText>
                    {editProfileText.headerPictures}
                </StyledText>
                {Array.from({length: globals.maxUploads}).map( (_,index) => (
                    index < props.uploadURLs.length ? 
                    <Picture
                        key={`edit-${uploadURLs[index]}`}
                        source={uploadURLs[index]}
                        onPress={() => switchImage(uploadURLs[index])}
                        onRemove={() => removeImage(uploadURLs[index])}
                        switching={uploadURLs[index] == switchURL}
                    /> :
                    <StyledButton
                        key={`edit-empty-${index}`}
                        testID={`edit-empty-${index}`}
                        onPress={uploadImage}
                    />
                ))}
            </StyledView>
            <StyledView>
                <StyledText>
                    {editProfileText.headerDescription}
                </StyledText>
                    <MyTextInput
                        initialInput={description}
                        errorMessage={editProfileText.descriptionError}
                        onSubmit={editDescription}
                        placeholder={editProfileText.descriptionPlaceholder}
                    />
            </StyledView>
            <StyledView>
                <StyledText>
                    {editProfileText.headerAttributes}
                </StyledText>
                {attributes.map( val => (
                    <StyledText
                        key={`attribute-${val}`}
                    >
                        {val}
                    </StyledText>
                ))}
                <MyButton
                    text={editProfileText.attributeButton}
                    onPressFunction={editAttributes}
                />
            </StyledView>
        </>
    )
}

export const EditProfileMob = observer(EditProfile);