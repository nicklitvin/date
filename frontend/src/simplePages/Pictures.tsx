import { useEffect, useState } from "react";
import { MySimplePage } from "../components/SimplePage"
import { FileUploadAndURI } from "../interfaces";
import { pictureText } from "../text"
import { StyledButton, StyledView } from "../styledElements";
import * as ImagePicker from "expo-image-picker";
import { globals } from "../globals";
import * as FileSystem from "expo-file-system";
import { MyButton } from "../components/Button";
import { Picture } from "../components/Picture";

interface Props {
    uploads: FileUploadAndURI[]
    onSubmit: (input : FileUploadAndURI[]) => any
    submitText: string
    returnUploadLength?: (input : number) => number
    returnSwitchURI?: (input : string|null) => string|null
}

export function Pictures(props : Props) {
    const [uploads, setUploads] = useState<FileUploadAndURI[]>(props.uploads);
    const [switchURI, setSwitchURI] = useState<string|null>(null);

    useEffect( () => {
        if (props.returnSwitchURI) props.returnSwitchURI(switchURI);
    }, [switchURI])

    useEffect( () => {
        if (props.returnUploadLength) props.returnUploadLength(uploads.length);
    }, [uploads])

    const uploadImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            selectionLimit: globals.maxUploads - uploads.length 
        });

        if (result.canceled) return

        const newUploads : FileUploadAndURI[] = [];
        for (const asset of result.assets) {
            try {
                const assetString = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: FileSystem.EncodingType.Base64
                })
                const buffer = Buffer.from(assetString);
                newUploads.push({
                    buffer: buffer,
                    mimetype: asset.mimeType as string,
                    uri: asset.uri
                })
            } catch (err) {}
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

    return <MySimplePage
        title={pictureText.pageTitle}
        subtitle={pictureText.pageSubtitle}
        marginTop="Pictures"
        beforeGapContent={
            <>
                <StyledView className="flex flex-row flex-wrap justify-center">
                    {Array.from({length : globals.maxUploads}).map( (_,index) => 
                        index < uploads.length ?
                        <Picture
                            key={`picture-${uploads[index].uri}`}
                            source={uploads[index].uri}
                            switching={uploads[index].uri == switchURI}
                            onPress={() => performSwitch(uploads[index].uri)}
                            onRemove={() => removeImage(uploads[index].uri)}
                        /> :
                        <StyledButton
                            key={`empty-button-${index}`}
                            className="w-[102px] h-[136px]  m-2 rounded-xl border border-front"
                            onPress={uploadImage}
                        />
                    )}
                </StyledView>
            </>
        }
        content={
            <>
                <StyledView className="mt-3 w-full items-center">
                    <MyButton
                        text={props.submitText}
                        onPressFunction={() => {
                            if (uploads.length > 0)
                                props.onSubmit(uploads);
                        }}
                    />
                </StyledView>
            </>
        }
    />
}