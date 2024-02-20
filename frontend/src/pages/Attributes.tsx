import { useState } from "react"
import { MyButton } from "../components/Button"
import { MySimplePage } from "../components/SimplePage"
import { StyledText, StyledView } from "../styledElements"
import { attributesText } from "../text"

interface Props {
    onSubmit: (input : string[]) => any
    attributes: { [title : string] : {id: string, value: string}[]}
    submitText: string
}

export function Attributes(props : Props) {
    const [attributes, setAttributes] = useState<string[]>([]);

    return <MySimplePage
        title={attributesText.pageTitle}
        subtitle={attributesText.pageSubtitle}
        content={
            <>
                {Object.entries(props.attributes).map( (entry) =>
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
                    text={props.submitText}
                    onPressFunction={ () => {
                        if (attributes.length > 0) {
                            props.onSubmit(attributes)
                        }
                    }}
                />
            </>
        }
    />
}