import { useState } from "react";
import { MySimplePage } from "../src/components/SimplePage"
import { DeleteImageInput, EditUserInput, ImageWithURI, PublicProfile, UploadImageInput, ViewableImage, WithKey } from "../src/interfaces";
import { editProfileText, pictureText } from "../src/text"
import { StyledView } from "../src/styledElements";
import { globals } from "../src/globals";
import * as FileSystem from "expo-file-system";
import { MyButton } from "../src/components/Button";
import { Picture } from "../src/components/Picture";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useStore } from "../src/store/RootStore";
import { router } from "expo-router";
import { URLs } from "../src/urls";
import { sendRequest } from "../src/utils";
import { observer } from "mobx-react-lite";
import { showToast } from "../src/components/Toast";


export function EditPictures() {
    const { receivedData } = useStore();
    const [switchURI, setSwitchURI] = useState<string|null>(null);

    if (!receivedData.profile) router.replace("Error");

    const uploadImage = async (fromFileSys : boolean) => {
        let asset : {uri: string, mime: string};
        try {
            if (fromFileSys) {
                const result = await DocumentPicker.getDocumentAsync({
                    copyToCacheDirectory: true,
                    multiple: false,
                    type: globals.acceptableFileTypes
                })

                if (result.canceled) return
                if (result.assets.filter(val => val.size && val.size > globals.maxPictureSize).length > 0) {
                    return showToast("Error",pictureText.sizeError);
                }
                asset = {
                    mime: result.assets[0].mimeType!,
                    uri: result.assets[0].uri
                }
            } else {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    selectionLimit: 1,
                    allowsEditing: true,
                });
                if (result.canceled) return

                const file = result.assets[0];
                if (file.width * file.height > globals.maxPictureSize || !file.mimeType) {
                    return showToast("Error", pictureText.sizeError);
                }
                asset = {uri: file.uri, mime: file.mimeType}
            }
        } catch (err) {
            console.log(err)
            showToast("Error",pictureText.uploadError);
            return
        }

        let newUpload : ImageWithURI;
        try {
            const assetString = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64
            })
            newUpload = {
                image: {
                    content: assetString,
                    mimetype: asset.mime as string
                },
                uri: asset.uri
            }
        } catch (err) {
            console.log(err)
            showToast("Error",pictureText.uploadError);
            return
        }

        try {
            const input : WithKey<UploadImageInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                image: {
                    content: newUpload.image.content,
                    mimetype: newUpload.image.mimetype
                }
            }
            const response = await sendRequest<ViewableImage[]>(URLs.uploadImage, input);
            if (response.message) {
                showToast("Error", response.message)
            } else if (response.data) {
                receivedData.setProfile({
                    ...receivedData.profile!,
                    images: response.data
                });
            }
        } catch (err) {
            showToast("Error",pictureText.uploadError);
            console.log(err);
            return
        }
    }

    const removeImage = async (uri : string) => {
        try {
            const input : WithKey<DeleteImageInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                imageID: uri
            };
            const response = await sendRequest<ViewableImage[]>(URLs.deleteImage, input);
            if (response.message) {
                showToast("Error", response.message);
            } else if (response.data) {
                if (switchURI == uri) setSwitchURI(null);
                receivedData.setProfile({
                    ...receivedData.profile!,
                    images: response.data
                });
            }
        } catch (err) {
            showToast("Error", editProfileText.cannotDeleteImage)
            console.log(err);
        }
    }

    const performSwitch = async (uri : string) => {
        if (switchURI == uri) {
            setSwitchURI(null);
        } else if (switchURI) {
            const copy = [...receivedData.profile!.images];
            const index1 = copy.findIndex( val => val.id == switchURI);
            const index2 = copy.findIndex( val => val.id == uri);
            const saved = copy[index1];
            copy[index1] = copy[index2];
            copy[index2] = saved;
            try {
                const input : WithKey<EditUserInput> = {
                    userID: receivedData.profile?.id!,
                    key: receivedData.loginKey,
                    setting: globals.settingImages,
                    value: copy.map(val => val.id)
                }
                const response = await sendRequest<{}>(URLs.editUser, input);
                if (response.message) {
                    showToast("Error", response.message)
                } else {
                    setSwitchURI(null);
                    receivedData.setProfile({
                        ...receivedData.profile!,
                        images: copy
                    });
                }
            } catch (err) {
                showToast("Error", pictureText.switchError);
                console.log(err);
            }
        } else {
            setSwitchURI(uri);
        }
    }

    if (!receivedData.profile) return <></>
    return <MySimplePage
        title={pictureText.pageTitle}
        subtitle={pictureText.pageSubtitle}
        pageType="Pictures"
        beforeGapContent={
            <>
                <StyledView className="flex flex-row flex-wrap justify-center">
                    {Array.from({length : globals.maxUploads}).map( (_,index) => 
                        index < receivedData.profile!.images.length ?
                        <StyledView key={`picture-${receivedData.profile!.images[index].id}`} className="m-2">
                            <Picture
                                source={receivedData.profile!.images[index].url}
                                switching={receivedData.profile!.images[index].id == switchURI}
                                onPress={() => performSwitch(receivedData.profile!.images[index].id)}
                                onRemove={() => removeImage(receivedData.profile!.images[index].id)}
                            />
                        </StyledView> :
                        <StyledView
                            key={`empty-button-${index}`}
                            className={`w-[102px] h-[136px] m-2 rounded-xl border border-front`}
                        />
                    )}
                </StyledView>
                <StyledView className="w-full flex items-center mt-3">
                    <MyButton
                        onPressFunction={() => uploadImage(false)}
                        text={pictureText.uploadImageButton}
                    />
                </StyledView>
                <StyledView className="w-full flex items-center mt-3">
                    <MyButton
                        onPressFunction={() => uploadImage(true)}
                        text={pictureText.uploadDocumentButton}
                    />
                </StyledView>
            </>
        }
    />
}
export const EditPicturesMob = observer(EditPictures);
export default EditPicturesMob;