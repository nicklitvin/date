import { useEffect, useState } from "react";
import { myText } from "../text";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
import { MyTextInput } from "../components/TextInput";
import { MyDateInput } from "../components/DateInput";
import { globals } from "../globals";
import { StyledButton, StyledText, StyledView } from "../styledElements";
import { AgePreferenceInput } from "../components/AgePreferenceInput";
import { FileUploadAndURI, UserInput } from "../interfaces";
import axios from "axios";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/RootStore";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import classNames from "classnames";

type PageType = "Create Profile" | "Name" | "Birthday" | "Gender" | "Gender Preference" |
    "Description" | "Attributes" | "Pictures" | "Age Preference" | "Final";

export const pageOrder : PageType[] = [
    "Create Profile","Name","Birthday", "Gender", "Age Preference", "Gender Preference",
    "Pictures", "Attributes", "Description", "Final"
]

interface Props {
    customPageStart? : number
    customBirthday?: Date
    customUploads?: FileUploadAndURI[]
    returnPageNumber?: (input : number) => number
    returnUploadOrder?: (input : string[]) => string
}

export function AccountCreation(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.customPageStart ?? 0);
    const { globalState } = useStore();

    const [name, setName] = useState<string>("");
    const [birthday, setBirthday] = useState<Date>(props.customBirthday ?? new Date());
    const [gender, setGender] = useState<string|null>(null);
    const [genderPreference, setGenderPreference] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");
    const [attributes, setAttributes] = useState<string[]>([]);
    const [minAge, setMinAge] = useState<number>(globals.minAge);
    const [maxAge, setMaxAge] = useState<number>(globals.maxAge);
    const [uploads, setUploads] = useState<FileUploadAndURI[]>(props.customUploads ?? []);

    const [switching, setSwitching] = useState<boolean>(false);
    const [switchURI, setSwitchURI] = useState<string|null>(null);

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    }

    useEffect( () => {
        if (props.returnPageNumber)
            props.returnPageNumber(currentPage)
    }, [currentPage])

    useEffect( () => {
        if (props.returnUploadOrder) 
            props.returnUploadOrder(uploads.map( val => val.uri))
    }, [uploads])

    const createUser = async () => {
        const userInput : UserInput = {
            name: name,
            birthday: birthday,
            ageInterest: [minAge, maxAge],
            attributes: attributes,
            description: description,
            email: globalState.email as string,
            gender: gender,
            genderInterest: genderPreference,
            files: uploads.map( upload => {
                return {
                    buffer: upload.buffer,
                    mimetype: upload.mimetype
                }
            })
        };
        try {
            if (globalState.useHttp) {
                await axios.post(globals.URLServer + globals.URLCreateUser, userInput);
            } else {
                globalState.setUserInput(userInput);
            }
        } catch (err) {}
    }

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

    switch (pageOrder[currentPage]) {
        case "Create Profile":
            return <MySimplePage
                title={myText.createProfileTitle}
                subtitle={myText.createProfileSubtitle}
                content={
                    <MyButton
                        text={myText.continue}
                        onPressFunction={goToNextPage}
                    />
                }
            />
        case "Name":
            return <MySimplePage
                title={myText.nameInputTitle}
                subtitle={myText.nameInputSubtitle}
                content={
                    <MyTextInput
                        placeholder={myText.nameInputPlaceholder}
                        errorMessage={myText.nameInputError}
                        saveMessage={setName}
                        afterSubmit={goToNextPage}
                    />
                }
            />
        case "Birthday":
            return <MySimplePage
                title={myText.birthdayInputTitle}
                subtitle={myText.birthdayInputSubtitle}
                content={
                    <MyDateInput
                        afterSubmit={goToNextPage}
                        saveDate={setBirthday}
                        customDate={props.customBirthday}
                    />
                }
            />
        case "Gender":
            return <MySimplePage
                title={myText.genderInputTitle}
                subtitle={myText.genderInputSubtitle}
                content={
                    <>
                        {globals.genders.map( (val) => 
                            <MyButton
                                key={`gender-${val}`}
                                text={val}
                                onPressFunction={() => {
                                    gender == val ? setGender(null) : setGender(val);
                                }}
                            />
                        )}
                        <MyButton
                            text={myText.continue}
                            onPressFunction={() => {
                                if (gender) {
                                    goToNextPage()
                                }
                            }}
                        />
                    </>
                }
            />
        case "Gender Preference":
            return <MySimplePage
                title={myText.genderPreferenceInputTitle}
                subtitle={myText.genderPreferenceInputSubtitle}
                content={
                    <>
                        {globals.genders.map( (val) => 
                            <MyButton
                                key={`gender-pref-${val}`}
                                text={val}
                                onPressFunction={() => {
                                    const index = genderPreference.findIndex( 
                                        selected => selected == val
                                    )
                                    if (index > -1) {
                                        setGenderPreference(
                                            genderPreference.splice(index,1)
                                        )
                                    } else {
                                        setGenderPreference(
                                            [...genderPreference, val]
                                        )
                                    }
                                }}
                            />
                        )}
                        <MyButton
                            text={myText.continue}
                            onPressFunction={() => {
                                if (genderPreference.length > 0) {
                                    goToNextPage()
                                }
                            }}
                        />
                    </>
                }
            />
        case "Description":
            return <MySimplePage
                title={myText.descriptionInputTitle}
                subtitle={myText.descriptionInputSubtitle}
                content={
                    <MyTextInput
                        placeholder={myText.decsriptionPlaceholder}
                        errorMessage={myText.descriptionErrorMessage}
                        saveMessage={setDescription}
                        afterSubmit={goToNextPage}
                    />
                }
            />
        case "Attributes":
            return <MySimplePage
                title={myText.attributesInputTitle}
                subtitle={myText.attributesInputSubtitle}
                content={
                    <>
                        {Object.entries(globals.attributes).map( (entry) =>
                            <StyledView key={`attributeType-${entry}`}>
                                <StyledText>
                                    {entry[0]}
                                </StyledText>
                                {entry[1].map( (content) =>
                                    <MyButton
                                        key={`attribute-${content.value}`}
                                        text={content.value}
                                        onPressFunction={ () => {
                                            const foundIndex = attributes.findIndex( 
                                                selected => selected == content.value
                                            )
                                            if (foundIndex > -1) {
                                                setAttributes(
                                                    attributes.filter( (_,index) =>
                                                        foundIndex != index
                                                    )
                                                )
                                            } else {
                                                setAttributes(
                                                    [...attributes, content.value]
                                                )
                                            }
                                        }}
                                    />
                                )}
                            </StyledView>
                        )}
                        <MyButton
                            text={myText.continue}
                            onPressFunction={ () => {
                                if (attributes.length > 0) {
                                    goToNextPage()
                                }
                            }}
                        />
                    </>
                }
            />
        case "Age Preference":
            return <MySimplePage
                title={myText.agePreferenceInputTitle}
                subtitle={myText.agePreferenceInputSubtitle}
                content={
                    <>
                        <AgePreferenceInput
                            minAge={minAge}
                            maxAge={maxAge}
                            setMinAge={setMinAge}   
                            setMaxAge={setMaxAge}
                        />
                        <MyButton
                            text={myText.continue}
                            onPressFunction={ () => {
                                if (minAge <= maxAge) {
                                    goToNextPage()
                                }
                            }}
                        />
                    </>
                }
            />
        case "Final":
            return <MySimplePage
                title={myText.finalInputTitle}
                subtitle={myText.finalInputSubtitle}
                content={
                    <MyButton
                        text={myText.continue}
                        onPressFunction={createUser}
                    />
                }
            />
        case "Pictures":
            return <MySimplePage
                title={myText.uploadInputTitle}
                subtitle={myText.uploadInputSubtitle}
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
                            text={myText.uploadButton}
                            onPressFunction={uploadImage}
                        />
                        <MyButton
                            text={myText.uploadSwitch}
                            onPressFunction={() => setSwitching(true)}
                        />
                        <MyButton
                            text={myText.continue}
                            onPressFunction={() => {
                                if (uploads.length > 0)
                                    goToNextPage()
                            }}
                        />
                    </>
                }
            />
    }
}

export const AccountCreationMob = observer(AccountCreation);