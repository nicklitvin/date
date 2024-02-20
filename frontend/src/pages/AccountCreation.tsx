import { useEffect, useState } from "react";
import { accountCreationText, generalText } from "../text";
import { MyButton } from "../components/Button";
import { MySimplePage } from "../components/SimplePage";
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
import { AccountCreationType } from "../types";
import { URLs } from "../urls";
import { Description } from "../simplePages/Description";
import { MyName } from "../simplePages/MyName";
import { Gender } from "../simplePages/Gender";
import { CreateProfile } from "../simplePages/CreateProfile";
import { Birthday } from "../simplePages/Birthday";

export const pageOrder : AccountCreationType[] = [
    "Create Profile","Name","Birthday", "Gender", "Age Preference", "Gender Preference",
    "Pictures", "Attributes", "Description", "Final"
]

interface Props {
    customPageStart? : number
    customBirthday?: Date
    customUploads?: FileUploadAndURI[]
    returnPageNumber?: (input : number) => number
    returnUploadOrder?: (input : string[]) => string
    returnGenderPreferences?: (input : number) => number
}

export function AccountCreation(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.customPageStart ?? 0);
    const { globalState, savedAPICalls } = useStore();

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
    const [showUserError, setShowUserError] = useState<boolean>(false);

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

    useEffect( () => {
        if (props.returnGenderPreferences) {
            props.returnGenderPreferences(genderPreference.length);
        }
    })

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
            const endpoint = URLs.server + URLs.createUser;
            if (globalState.useHttp) {
                await axios.post(endpoint, userInput);
            } else {
                savedAPICalls.setCreateUser(userInput);
            }
        } catch (err) {
            setShowUserError(true);
        }
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
            return <CreateProfile
                submitText={generalText.continue}
                onSubmit={goToNextPage}
            />
        case "Name":
            return <MyName
                onSubmit={(input : string) => {
                    setName(input);
                    goToNextPage();
                }}
            />
        case "Birthday":
            return <Birthday
                customBirthday={props.customBirthday}
                submitText={generalText.continue}
                onSubmit={(input : Date) => {
                    setBirthday(input);
                    goToNextPage();
                }}
            />
        case "Gender":
            return <Gender
                genders={globals.genders}
                submitText={generalText.continue}
                onSubmit={(input : string) => {
                    setGender(input);
                    goToNextPage();
                }}
            />
        case "Gender Preference":
            return <MySimplePage
                title={accountCreationText.genderPreferenceInputTitle}
                subtitle={accountCreationText.genderPreferenceInputSubtitle}
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
                            text={accountCreationText.continue}
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
            return <Description onSubmit={(input : string) => {
                    setDescription(input);
                    goToNextPage();
                }}
            />
        case "Attributes":
            return <MySimplePage
                title={accountCreationText.attributesInputTitle}
                subtitle={accountCreationText.attributesInputSubtitle}
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
                            text={accountCreationText.continue}
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
                title={accountCreationText.agePreferenceInputTitle}
                subtitle={accountCreationText.agePreferenceInputSubtitle}
                content={
                    <>
                        <AgePreferenceInput
                            minAge={minAge}
                            maxAge={maxAge}
                            setMinAge={setMinAge}   
                            setMaxAge={setMaxAge}
                        />
                        <MyButton
                            text={accountCreationText.continue}
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
                title={accountCreationText.finalInputTitle}
                subtitle={accountCreationText.finalInputSubtitle}
                content={
                    <>
                        <MyButton
                            text={accountCreationText.continue}
                            onPressFunction={createUser}
                        />
                        <StyledText className={classNames(
                            showUserError ? "block" : "hidden"
                        )}>
                            {accountCreationText.finalInputError}
                        </StyledText>
                    </>
                }
            />
        case "Pictures":
            return <MySimplePage
                title={accountCreationText.uploadInputTitle}
                subtitle={accountCreationText.uploadInputSubtitle}
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
                            text={accountCreationText.uploadButton}
                            onPressFunction={uploadImage}
                        />
                        <MyButton
                            text={accountCreationText.uploadSwitch}
                            onPressFunction={() => setSwitching(true)}
                        />
                        <MyButton
                            text={accountCreationText.continue}
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