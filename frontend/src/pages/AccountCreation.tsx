import { useEffect, useState } from "react";
import { generalText } from "../text";
import { globals } from "../globals";
import { FileUploadAndURI, UserInput } from "../interfaces";
import axios from "axios";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/RootStore";
import { AccountCreationType } from "../types";
import { URLs } from "../urls";
import { Description } from "../simplePages/Description";
import { MyName } from "../simplePages/MyName";
import { Gender } from "../simplePages/Gender";
import { CreateProfile } from "../simplePages/CreateProfile";
import { Birthday } from "../simplePages/Birthday";
import { GenderPreference } from "../simplePages/GenderPreference";
import { Attributes } from "./Attributes";
import { AgePreference } from "../simplePages/AgePreference";
import { Final } from "../simplePages/Final";
import { Pictures } from "../simplePages/Pictures";

export const pageOrder : AccountCreationType[] = [
    "Create Profile","Name","Birthday", "Gender", "Age Preference", "Gender Preference",
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
    const { globalState, savedAPICalls } = useStore();

    const [name, setName] = useState<string>("");
    const [birthday, setBirthday] = useState<Date>(props.customBirthday ?? new Date());
    const [gender, setGender] = useState<string|null>(null);
    const [genderPreference, setGenderPreference] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");
    const [attributes, setAttributes] = useState<string[]>([]);
    const [uploads, setUploads] = useState<FileUploadAndURI[]>(props.customUploads ?? []);
    const [agePreference, setAgePreference] = useState<[number, number]>(
        [globals.minAge, globals.maxAge]
    );

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    }

    useEffect( () => {
        if (props.returnPageNumber) props.returnPageNumber(currentPage)
            
    }, [currentPage])

    const createUser = async () => {
        const userInput : UserInput = {
            name: name,
            birthday: birthday,
            ageInterest: agePreference,
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
     
        const endpoint = URLs.server + URLs.createUser;
        if (globalState.useHttp) {
            await axios.post(endpoint, userInput);
        } else {
            savedAPICalls.setCreateUser(userInput);
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
            return <GenderPreference
                genders={globals.genders}
                onSubmit={(input : string[]) => {
                    setGenderPreference(input);
                    goToNextPage();
                }}
                submitText={generalText.continue}
            />
        case "Description":
            return <Description 
                onSubmit={(input : string) => {
                    setDescription(input);
                    goToNextPage();
                }}
            />
        case "Attributes":
            return <Attributes
                attributes={globals.attributes}
                onSubmit={(input : string[]) => {
                    setAttributes(input);
                    goToNextPage();
                }}
                submitText={generalText.continue}
            />
        case "Age Preference":
            return <AgePreference
                minAge={globals.minAge}
                maxAge={globals.maxAge}
                submitText={generalText.continue}
                onSubmit={(input : [number, number]) => {
                    setAgePreference(input);
                    goToNextPage();
                }}
            />
        case "Final":
            return <Final
                submitText={generalText.continue}
                onSubmit={createUser}
            />
        case "Pictures":
            return <Pictures
                uploads={uploads}
                onSubmit={(input : FileUploadAndURI[]) => {
                    setUploads(input);
                    goToNextPage();
                }}
                submitText={generalText.continue}
            />
    }
}

export const AccountCreationMob = observer(AccountCreation);