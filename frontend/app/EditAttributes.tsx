import { useEffect, useState } from "react"
import { MyButton } from "../src/components/Button"
import { MySimplePage } from "../src/components/SimplePage"
import { StyledScroll, StyledText, StyledView } from "../src/styledElements"
import { attributesText, generalText } from "../src/text"
import { globals } from "../src/globals"
import classNames from "classnames"
import { observer } from "mobx-react-lite"
import { useStore } from "../src/store/RootStore"
import { EditUserInput, PublicProfile, WithKey } from "../src/interfaces"
import { URLs } from "../src/urls"
import { sendRequest } from "../src/utils"
import { router } from "expo-router"

export function EditAttributes() {
    const { receivedData } = useStore();
    const [profile, setProfile] = useState<PublicProfile|null>(receivedData.profile);
    const [showError, setShowError] = useState<boolean>(false);
    const [attributes, setAttributes] = useState<string[]>(profile?.attributes ?? []);

    useEffect( () => {
        if (profile) {
            receivedData.setProfile(profile);
        } else {
            router.push("EditProfile");
        }
    }, [profile])

    const submitChanges = async () => {
        if (attributes.length == 0 || attributes.length > globals.maxAttributes) {
            setShowError(true)
            return
        } 

        try {
            const input : WithKey<EditUserInput> = {
                userID: receivedData.profile?.id!,
                key: receivedData.loginKey,
                setting: globals.settingAttributes,
                value: attributes
            }
            await sendRequest(URLs.editUser, input);
            setProfile({
                ...receivedData.profile!,
                attributes: attributes
            })
            router.back();
        } catch (err) { 
            console.log(err);
        }
    }

    return <MySimplePage
        title={attributesText.pageTitle}
        subtitle={attributesText.pageSubtitle}
        pageType="Attributes"
        content={
            <StyledView className="w-full flex items-center mt-3">
                <StyledText className={classNames(
                    "p-3",
                    showError ? "opacity-1" : "opacity-0" 
                )}>
                    {attributesText.error}
                </StyledText>
                <MyButton
                    text={generalText.saveChanges}
                    onPressFunction={submitChanges}
                />
            </StyledView>
        }
        beforeGapContent={
            <StyledView className="w-full h-[600px]">
                <StyledScroll showsVerticalScrollIndicator={false}>
                    {Object.entries(receivedData.attributes).map( (entry) => (
                        <StyledView 
                            className="flex w-full items-center"
                            key={`type-${entry[0]}`}
                        >
                            <StyledText className="text-xl pb-2 w-full text-center font-bold">
                                {entry[0]}
                            </StyledText>
                            <StyledView className="flex flex-row flex-wrap justify-center">
                                {entry[1].map( (value) =>
                                    <StyledView 
                                        key={`attribute-${value}`}
                                    >
                                        <MyButton
                                            text={value}
                                            smallButton={true}
                                            invertColor={attributes.includes(value)}
                                            onPressFunction={ () => {
                                                setShowError(false);
                                                const foundIndex = attributes.findIndex( 
                                                    selected => selected == value
                                                )
                                                if (foundIndex > -1) {
                                                    setAttributes(
                                                        attributes.filter( (_,index) =>
                                                            foundIndex != index
                                                        )
                                                    )
                                                } else {
                                                    setAttributes(
                                                        [...attributes, value]
                                                    )
                                                }
                                            }}
                                        />
                                    </StyledView>
                                )}    
                            </StyledView>
                        </StyledView>
                    ))}
                </StyledScroll>
            </StyledView> 
        }
    />
}
export const EditAttributesMob = observer(EditAttributes);
export default EditAttributesMob;