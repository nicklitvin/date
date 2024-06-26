import { useEffect, useState } from "react";
import { MySimplePage } from "../components/SimplePage"
import { pictureText } from "../text"
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { globals } from "../globals";
import * as FileSystem from "expo-file-system";
import { MyButton } from "../components/Button";
import { Picture } from "../components/Picture";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Buffer } from "buffer"
import classNames from "classnames";
import { ImageWithURI } from "../interfaces";
import { showToast } from "../components/Toast";

interface Props {
    uploads: ImageWithURI[]
    onSubmit: (input : ImageWithURI[]) => any
    submitText: string
    returnUploadLength?: (input : number) => number
    returnSwitchURI?: (input : string|null) => string|null
    goBack?: () => any
}

export function Pictures(props : Props) {
    const [uploads, setUploads] = useState<ImageWithURI[]>(props.uploads);
    const [switchURI, setSwitchURI] = useState<string|null>(null);

    useEffect( () => {
        if (props.returnSwitchURI) props.returnSwitchURI(switchURI);
    }, [switchURI])

    useEffect( () => {
        if (props.returnUploadLength) props.returnUploadLength(uploads.length);
    }, [uploads])

    const uploadImage = async (fromFileSys : boolean) => {
        let assets : {uri: string, mime: string}[] = [];
        try {
            if (fromFileSys) {
                const result = await DocumentPicker.getDocumentAsync({
                    copyToCacheDirectory: true,
                    multiple: true,
                    type: globals.acceptableFileTypes
                })

                if (result.canceled) return
                if (result.assets.filter(val => val.size && val.size > globals.maxPictureSize).length > 0) {
                    return showToast("Error",pictureText.sizeError);
                }
                assets = result.assets.
                    filter(val => val.size && val.size <= globals.maxPictureSize && val.mimeType).
                    slice(0,globals.maxUploads - uploads.length).
                    map( val => ({
                        uri: val.uri,
                        mime: val.mimeType!
                    })
                );    
            } else {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    selectionLimit: globals.maxUploads - uploads.length,
                    allowsEditing: true,
                });
                if (result.canceled) return

                const file = result.assets[0];
                if (file.width * file.height > globals.maxPictureSize || !file.mimeType) {
                    return showToast("Error", pictureText.sizeError);
                }
                assets = [{uri: file.uri, mime: file.mimeType}]
            }
        } catch (err) {
            showToast("Error",pictureText.uploadError);
            console.log(err)
            return
        }

        const newUploads : ImageWithURI[] = [];
        for (const asset of assets) {
            try {
                const assetString = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: FileSystem.EncodingType.Base64
                })
                newUploads.push({
                    image: {
                        content: assetString,
                        mimetype: asset.mime as string
                    },
                    uri: asset.uri
                })
            } catch (err) {
                showToast("Error",pictureText.uploadError);
                console.log(err);
                return 
            }
        }

        setUploads(uploads.concat(newUploads));
    }

    const removeImage = (uri : string) => {
        setUploads(uploads.filter( upload => upload.uri != uri));
        if (switchURI == uri) setSwitchURI(null);
    }

    const performSwitch = async (uri : string) => {
        if (switchURI == uri) {
            setSwitchURI(null);
        } else if (switchURI) {
            const copy = [...uploads];
            const index1 = copy.findIndex( val => val.uri == switchURI);
            const index2 = copy.findIndex( val => val.uri == uri);
            const saved = copy[index1];
            copy[index1] = copy[index2];
            copy[index2] = saved;
            setUploads(copy);
            setSwitchURI(null);
        } else {
            setSwitchURI(uri);
        }
    }

    const submit = () => {
        if (uploads.length > 0 && props.onSubmit) {
            props.onSubmit(uploads);
        } else {
            showToast("Error",pictureText.noPicturesError)
        }
    }

    return <MySimplePage
        title={pictureText.pageTitle}
        subtitle={pictureText.pageSubtitle}
        goBackFunc={props.goBack}
        pageType="Pictures"
        beforeGapContent={
            <>
                <StyledView className="flex flex-row flex-wrap justify-center">
                    {Array.from({length : globals.maxUploads}).map( (_,index) => 
                        index < uploads.length ?
                        <StyledView key={`picture-${uploads[index].uri}`} className="m-2">
                            <Picture
                                source={uploads[index].uri}
                                switching={uploads[index].uri == switchURI}
                                onPress={() => performSwitch(uploads[index].uri)}
                                onRemove={() => removeImage(uploads[index].uri)}
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
            <StyledView className="mt-3 w-full items-center">
                <MyButton
                    text={props.submitText}
                    onPressFunction={submit}
                />
            </StyledView>
        }
    />
}