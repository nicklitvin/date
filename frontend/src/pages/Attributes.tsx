import { useState } from "react"
import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { StyledScroll, StyledText, StyledView } from "../styledElements"
import { attributesText } from "../text"
import { globals } from "../globals"
import classNames from "classnames"
import { ScrollView } from "react-native"

interface Props {
    onSubmit: (input : string[]) => any
    attributes: { [title : string] : {id: string, value: string}[]}
    submitText: string
}

export function Attributes(props : Props) {
    const [attributes, setAttributes] = useState<string[]>([]);
    const [showError, setShowError] = useState<boolean>(false);

    return <MySimplePage
        title={attributesText.pageTitle}
        subtitle={attributesText.pageSubtitle}
        marginTop="Attributes"
        content={
            <StyledView className="w-full flex items-center mt-3">
                <StyledText className={classNames(
                    "p-3",
                    showError ? "opacity-1" : "opacity-0" 
                )}>
                    {attributesText.error}
                </StyledText>
                <MyButton
                    text={props.submitText}
                    onPressFunction={ () => {
                        if (attributes.length > 0 && attributes.length < globals.maxAttributes) {
                            props.onSubmit(attributes)
                        } else {
                            setShowError(true)
                        }
                    }}
                />
            </StyledView>
        }
        beforeGapContent={
            <StyledScroll className="h-2/3">
                {Object.entries(props.attributes).map( (entry) =>
                    <StyledView 
                        className="w-full items-center mb-8"
                        key={`attributeType-${entry}`}
                    >
                        <StyledText className="text-xl mb-2">
                            {entry[0]}
                        </StyledText>
                        <StyledView className="flex w-full flex-wrap flex-row justify-center">
                            {entry[1].map( (content) =>
                                <MyButton
                                    key={`attribute-${content.value}`}
                                    text={content.value}
                                    smallButton={true}
                                    invertColor={attributes.includes(content.value)}
                                    onPressFunction={ () => {
                                        setShowError(false);
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
                    </StyledView>
                )}
            </StyledScroll>
        }
    />
}