import { observer } from "mobx-react-lite";
import { PageHeader } from "../src/components/PageHeader";
import { editProfileText } from "../src/text";
import { useEffect, useState } from "react";
import { StyledButton, StyledImage, StyledScroll, StyledText, StyledView } from "../src/styledElements";
import { globals } from "../src/globals";
import { Picture } from "../src/components/Picture";
import axios from "axios";
import { DeleteImageInput, EditUserInput, FileUploadAndURI, PublicProfile, UploadImageInput } from "../src/interfaces";
import { URLs } from "../src/urls";
import { MediaTypeOptions, launchImageLibraryAsync } from "expo-image-picker";
import { EncodingType, readAsStringAsync } from "expo-file-system";
import { MyTextInput } from "../src/components/TextInput";
import { MyButton } from "../src/components/Button";
import { Spacing } from "../src/components/Spacing";
import { router } from "expo-router";

interface Props {
    profile: PublicProfile
    uploadImageData?: FileUploadAndURI
    returnUploadURLsLength?: (input : number) => number
    returnDescription?: (input : string) => string
    returnAttributeLength?: (input : number) => number
}

export function EditProfile() {
    const props : Props = {
        profile: {
            name: "Michael",
            age: 21,
            attributes: ["asd","asrqd", "asdnw", "ajshdkasdsa", "ajljshdwgeiqw"],
            description: "this is a desceiption askdh askdjh aks dhsk ds dkas daksj daks kad jhask dajsh kasdhjasdhask das dhaskd ask dashd ",
            gender: "Male",
            id: "abc",
            images: [
                "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*",
                "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
            ],
            alcohol: "Often",
            smoking: "Often",
        }
    }

    const [uploadURLs, setUploadURLs] = useState<string[]>(props.profile.images);
    const [switchURL, setSwitchURL] = useState<string|null>(null);
    const [description, setDescription] = useState<string>(props.profile.description);
    const [attributes, setAttributes] = useState<string[]>(props.profile.attributes);

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
        <StyledScroll>
        <StyledView className="w-full h-full bg-back">
            <PageHeader
                title={editProfileText.pageTitle}
                imageType="Edit"
            />
            <StyledView className="w-full px-5">

            <StyledText className="font-bold text-xl">
                {editProfileText.headerPictures}
            </StyledText>
            <StyledView className="w-full flex flex-wrap flex-row items-center">
            {Array.from({length: globals.maxUploads}).map( (_,index) => (
                index < uploadURLs.length ? 
                <StyledView className="m-2" key={`edit-${uploadURLs[index]}`}>
                    <Picture
                        source={uploadURLs[index]}
                        switching={false}
                        disable={true}
                    />
                </StyledView> :    
                <StyledView 
                    className="w-[102px] h-[136px] rounded-xl border border-front m-2"
                    key={`edit-empty-${index}`}
                />
            ))}
            </StyledView>
            <Spacing size="md"/>
            <StyledView className="w-full items-center flex">
                <MyButton
                    text={editProfileText.editImages}
                    onPressFunction={() => {router.push("/EditPictures")}}
                />
            </StyledView>
            <Spacing size="lg"/>
            <StyledText className="font-bold text-xl">    
                {editProfileText.headerDescription}
            </StyledText>
            <Spacing size="md"/>
            <MyButton
                text={description}
                onPressFunction={() => {router.push("/EditDescription")}}
                fullSize={true}
            />
            <Spacing size="lg"/>
            <StyledText className="font-bold text-xl">
                {editProfileText.headerAttributes}
            </StyledText>
            <Spacing size="md"/>
            <StyledView className="flex flex-start w-full flex-row flex-wrap">
                {attributes.map( val => (
                    <MyButton
                        key={`attribute-${val}`}
                        text={val}
                        onPressFunction={() => {}}
                        smallButton={true}
                    />
                ))}
            </StyledView>
            <Spacing size="lg"/>
            <StyledView className="w-full flex items-center">
                <MyButton
                    text={editProfileText.editAttributes}
                    onPressFunction={() => {router.push("/EditAttributes")}}
                />
            </StyledView>
            <Spacing size="lg"/>

            </StyledView>
        </StyledView>
        </StyledScroll>
    )
}

export const EditProfileMob = observer(EditProfile);
export default EditProfileMob;