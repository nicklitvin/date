import { StyledText, StyledView } from "./styledElements";

interface Props {
    title: string
    subtitle: string
    content: any
}

export function MySimplePage({title, subtitle, content} : Props) {
    return (
        <StyledView>
            <StyledText>
                {title}
            </StyledText>
            <StyledText>
                {subtitle}
            </StyledText>
            {content}
        </StyledView>
    )
}