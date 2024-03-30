import { useEffect, useState } from "react";
import { generalText } from "../src/text";
import { globals } from "../src/globals";
import { FileUploadAndURI, UserInput, WithKey } from "../src/interfaces";
import { observer } from "mobx-react-lite";
import { useStore } from "../src/store/RootStore";
import { AccountCreationType } from "../src/types";
import { URLs } from "../src/urls";
import { Description } from "../src/simplePages/Description";
import { MyName } from "../src/simplePages/MyName";
import { Gender } from "../src/simplePages/Gender";
import { CreateProfile } from "../src/simplePages/CreateProfile";
import { Birthday } from "../src/simplePages/Birthday";
import { GenderPreference } from "../src/simplePages/GenderPreference";
import { AgePreference } from "../src/simplePages/AgePreference";
import { Final } from "../src/simplePages/Final";
import { Pictures } from "../src/simplePages/Pictures";
import { Alcohol } from "../src/simplePages/Alcohol";
import { Smoking } from "../src/simplePages/Smoking";
import { Attributes } from "../src/pages/Attributes";
import { sendRequest } from "../src/utils";

export const pageOrder : AccountCreationType[] = [
    "Create Profile","Name","Birthday", "Gender", "Alcohol", "Smoking", "Age Preference", "Gender Preference",
    "Pictures", "Attributes", "Description", "Final"
]

interface Props {
    customPageStart? : number
    customBirthday?: Date
    customUploads?: FileUploadAndURI[]
    returnPageNumber?: (input : number) => number
}

export function AccountCreation(props : Props) {
    const [currentPage, setCurrentPage] = useState<number>(props.customPageStart ?? 0);
    const { globalState, receivedData } = useStore();

    const [name, setName] = useState<string>("");
    const [birthday, setBirthday] = useState<Date>(props.customBirthday ?? new Date(2000,0,1));
    const [gender, setGender] = useState<string|undefined>();
    const [genderPreference, setGenderPreference] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");
    const [attributes, setAttributes] = useState<string[]>([]);
    const [uploads, setUploads] = useState<FileUploadAndURI[]>(props.customUploads ?? []);
    const [agePreference, setAgePreference] = useState<[number, number]>(
        [globals.minAge, globals.maxAge]
    );
    const [alcohol, setAlcohol] = useState<string>("");
    const [smoking, setSmoking] = useState<string>("");

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    }

    const goBack = () => {
        setCurrentPage(currentPage - 1)
    }

    useEffect( () => {
        if (props.returnPageNumber) props.returnPageNumber(currentPage)
    }, [currentPage])

    const createUser = async () => {
        const userInput : WithKey<UserInput> = {
            key: receivedData.loginKey,
            name: name,
            birthday: birthday,
            ageInterest: agePreference,
            attributes: attributes,
            description: description,
            email: globalState.email as string,
            gender: gender!,
            genderInterest: genderPreference,
            alcohol: alcohol,
            smoking: smoking,
            files: uploads.map( upload => {
                return {
                    buffer: upload.buffer,
                    mimetype: upload.mimetype
                }
            })
        };
     
        try {
            await sendRequest(URLs.createUser, userInput);
        } catch (err) {}
    }

    switch (pageOrder[currentPage]) {
        case "Create Profile":
            return <CreateProfile
                submitText={generalText.continue}
                onSubmit={goToNextPage}
            />
        case "Name":
            return <MyName
                input={name}
                goBack={goBack}
                onSubmit={(input : string) => {
                    setName(input);
                    goToNextPage();
                }}
            />
        case "Birthday":
            return <Birthday
                goBack={goBack}
                customBirthday={birthday}
                submitText={generalText.continue}
                onSubmit={(input : Date) => {
                    setBirthday(input);
                    goToNextPage();
                }}
            />
        case "Gender":
            return <Gender
                input={gender}
                goBack={goBack}
                genders={globals.genders}
                submitText={generalText.continue}
                onSubmit={(input : string) => {
                    setGender(input);
                    goToNextPage();
                }}
            />
        case "Gender Preference":
            return <GenderPreference
                genderState={genderPreference}
                setGenders={setGenderPreference}
                genders={globals.genders}
                goBack={goBack}
                onSubmit={goToNextPage}
                submitText={generalText.continue}
            />
        case "Description":
            return <Description 
                input={description}
                goBack={goBack}
                onSubmit={(input : string) => {
                    setDescription(input);
                    goToNextPage();
                }}
            />
        case "Attributes":
            return <Attributes
                selectedAttributes={attributes}
                goBack={goBack}    
                attributes={globals.attributes}
                onSubmit={(input : string[]) => {
                    setAttributes(input);
                    goToNextPage();
                }}
                submitText={generalText.continue}
            />
        case "Age Preference":
            return <AgePreference
                goBack={goBack}
                ages={agePreference}
                setAges={setAgePreference}
                submitText={generalText.continue}
                onSubmit={goToNextPage}
            />
        case "Final":
            return <Final
                goBack={goBack}
                submitText={generalText.continue}
                onSubmit={createUser}
            />
        case "Pictures":
            return <Pictures
                goBack={goBack}
                uploads={uploads}
                onSubmit={(input : FileUploadAndURI[]) => {
                    setUploads(input);
                    goToNextPage();
                }}
                submitText={generalText.continue}
            />
        case "Alcohol":
            return <Alcohol
                input={alcohol}
                goBack={goBack}
                onSubmit={ (input : string) => {
                    setAlcohol(input);
                    goToNextPage();
                }}
            />
        case "Smoking":
            return <Smoking
                input={smoking}
                goBack={goBack}
                onSubmit={ (input : string) => {
                    setSmoking(input);
                    goToNextPage();
                }}
            />
    }
}

export const AccountCreationMob = observer(AccountCreation);
export default AccountCreationMob;