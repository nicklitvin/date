import { useState } from "react"
import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { StyledScroll, StyledText, StyledView } from "../styledElements"
import { attributesText } from "../text"
import { globals } from "../globals"
import classNames from "classnames"
import { Attributes } from "../interfaces"

interface Props {
    onSubmit: (input : string[]) => any
    attributes: Attributes
    submitText: string
    goBack?: () => any
    selectedAttributes?: string[]
}

export function AttributesPage(props : Props) {
    const [attributes, setAttributes] = useState<string[]>(props.selectedAttributes ?? []);
    const [showError, setShowError] = useState<boolean>(false);

    return <MySimplePage
        title={attributesText.pageTitle}
        subtitle={attributesText.pageSubtitle}
        marginTop="Attributes"
        goBackFunc={props.goBack}
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
            <StyledView className="w-full h-[600px]">
                <StyledScroll showsVerticalScrollIndicator={false}>
                    {Object.entries(props.attributes).map( (entry) => (
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