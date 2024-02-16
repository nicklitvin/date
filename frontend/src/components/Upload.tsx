import { useState } from "react";
import { StyledButton } from "../styledElements";
import { Image } from "expo-image";
import { FileUpload } from "../interfaces";
import * as ImagePicker from "expo-image-picker";

interface Props {

}

export function Upload(props : Props) {
    const [imageURI, setImageURI] = useState<string|null>(null);

    const interactWithUpload = async () => {
        const image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });

        if (image.canceled) return 

        setImageURI(image.assets[0].uri);
    }

    return (
        <StyledButton
            onPress={interactWithUpload}
        />
    )

}