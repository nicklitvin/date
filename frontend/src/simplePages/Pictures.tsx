import { useState } from "react";
import { MySimplePage } from "../components/SimplePage"
import { FileUploadAndURI } from "../interfaces";
import { pictureText } from "../text"
import { StyledButton, StyledView } from "../styledElements";
import classNames from "classnames";
import * as ImagePicker from "expo-image-picker";
import { globals } from "../globals";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { MyButton } from "../components/Button";

interface Props {
    uploads: FileUploadAndURI[]
    onSubmit: (input : FileUploadAndURI[]) => any
    submitText: string
}

export function Pictures(props : Props) {
    const [uploads, setUploads] = useState<FileUploadAndURI[]>(props.uploads);
    const [switching, setSwitching] = useState<boolean>(false);
    const [switchURI, setSwitchURI] = useState<string|null>(null);

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
    }

    const performSwitch = async (uri : string) => {
        if (!switching) return

        if (switchURI == uri) setSwitchURI(null);
        if (switchURI) {
            const copy = [...uploads];
            const index1 = copy.findIndex( val => val.uri == switchURI);
            const index2 = copy.findIndex( val => val.uri == uri);
            const saved = copy[index1];
            copy[index1] = copy[index2];
            copy[index2] = saved;
            setUploads(copy);
            setSwitching(false);
            setSwitchURI(null);
        } else {
            setSwitchURI(uri);
        }
    }

    return <MySimplePage
        title={pictureText.pageTitle}
        subtitle={pictureText.pageSubtitle}
        content={
            <>
                {uploads.map( (upload) => (
                    switching ?
                    <StyledView 
                        key={`image-${upload.uri}`} 
                        className={classNames(
                            switchURI == upload.uri ? "" : ""
                        )
                    }>
                        <StyledButton 
                            onPress={() => performSwitch(upload.uri)}
                            testID={`image-${upload.uri}`} 
                        >
                            <Image 
                                source={upload.uri}
                            />
                            <StyledButton/>
                        </StyledButton>
                    </StyledView> :
                    <StyledView key={`image-${upload.uri}`}>
                        <Image 
                            source={upload.uri}
                        />
                        <StyledButton
                            onPress={() => removeImage(upload.uri)}
                        />
                    </StyledView>
                ))}
                <MyButton
                    text={pictureText.uploadButton}
                    onPressFunction={uploadImage}
                />
                <MyButton
                    text={pictureText.uploadSwitch}
                    onPressFunction={() => setSwitching(true)}
                />
                <MyButton
                    text={props.submitText}
                    onPressFunction={() => {
                        if (uploads.length > 0)
                            props.onSubmit(uploads);
                    }}
                />
            </>
        }
    />
}