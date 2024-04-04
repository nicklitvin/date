import { useEffect, useState } from "react";
import { MySimplePage } from "../src/components/SimplePage"
import { DeleteImageInput, EditUserInput, FileUploadAndURI, PublicProfile, UploadImageInput, WithKey } from "../src/interfaces";
import { pictureText } from "../src/text"
import { StyledText, StyledView } from "../src/styledElements";
import { globals } from "../src/globals";
import * as FileSystem from "expo-file-system";
import { MyButton } from "../src/components/Button";
import { Picture } from "../src/components/Picture";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import classNames from "classnames";
import { useStore } from "../src/store/RootStore";
import { Redirect, router } from "expo-router";
import { URLs } from "../src/urls";
import { createTimeoutSignal, sendRequest } from "../src/utils";
import { observer } from "mobx-react-lite";


export function EditPictures() {
    const { receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    if (!profile) router.push("Error");

    const [switchURI, setSwitchURI] = useState<string|null>(null);
    const [showError, setShowError] = useState<boolean>(false);

    useEffect( () => {
        if (profile) {
            receivedData.setProfile(profile);
        }
    }, [profile])

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
                setShowError(result.assets.filter(val => val.size && val.size > globals.maxPictureSize).
                    length > 0
                );
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
                    setShowError(true)
                    return
                }
                setShowError(false);
                asset = {uri: file.uri, mime: file.mimeType}
            }
        } catch (err) {
            setShowError(true);
            console.log(err)
            return
        }

        let newUpload : FileUploadAndURI;
        try {
            const assetString = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64
            })
            newUpload = {
                buffer: assetString,
                mimetype: asset.mime as string,
                uri: asset.uri
            }
        } catch (err) {
            setShowError(true);
            console.log(err)
            return
        }

        try {
            const input : WithKey<UploadImageInput> = {
                key: receivedData.loginKey,
                image: {
                    buffer: newUpload.buffer,
                    mimetype: newUpload.mimetype
                }
            }
            const response = await sendRequest(URLs.uploadImage, input);
            setProfile({
                ...profile!,
                images: response.data.data
            });
        } catch (err) {
            console.log(err);
            return
        }
    }

    const removeImage = async (uri : string) => {
        try {
            const input : WithKey<DeleteImageInput> = {
                key: receivedData.loginKey,
                imageID: uri
            };
            const response = await sendRequest(URLs.deleteImage, input);
            if (switchURI == uri) setSwitchURI(null);
            setProfile({
                ...profile!,
                images: response.data.data
            });
        } catch (err) {
            console.log(err);
        }
    }

    const performSwitch = async (uri : string) => {
        if (switchURI == uri) {
            setSwitchURI(null);
        } else if (switchURI) {
            const copy = [...profile!.images];
            const index1 = copy.findIndex( val => val.id == switchURI);
            const index2 = copy.findIndex( val => val.id == uri);
            const saved = copy[index1];
            copy[index1] = copy[index2];
            copy[index2] = saved;
            try {
                const input : WithKey<EditUserInput> = {
                    key: receivedData.loginKey,
                    setting: globals.settingImages,
                    value: copy.map(val => val.id)
                }
                await sendRequest(URLs.editUser, input);
                setSwitchURI(null);
                setProfile({
                    ...profile!,
                    images: copy
                });
            } catch (err) {
                console.log(err);
            }
        } else {
            setSwitchURI(uri);
        }
    }

    if (!profile) return <></>
    return <MySimplePage
        title={pictureText.pageTitle}
        subtitle={pictureText.pageSubtitle}
        pageType="Pictures"
        beforeGapContent={
            <>
                <StyledView className="flex flex-row flex-wrap justify-center">
                    {Array.from({length : globals.maxUploads}).map( (_,index) => 
                        index < profile.images.length ?
                        <StyledView key={`picture-${profile.images[index].id}`} className="m-2">
                            <Picture
                                source={profile.images[index].url}
                                switching={profile.images[index].id == switchURI}
                                onPress={() => performSwitch(profile.images[index].id)}
                                onRemove={() => removeImage(profile.images[index].id)}
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
        content={
            <>
                <StyledText className={classNames(
                    showError ? "opacity-100" : "opacity-0",
                    "text-base text-center"
                )}>
                    {pictureText.uploadError}
                </StyledText>
            </>
        }
    />
}
export const EditPicturesMob = observer(EditPictures);
export default EditPicturesMob;