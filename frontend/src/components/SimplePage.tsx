import { StyledText, StyledView } from "../styledElements";

interface Props {
    title: string
    subtitle: string
    content: any
}

export function MySimplePage({title, subtitle, content} : Props) {
    return (
        <StyledView className="w-full h-full flex flex-col items-center justify-center">
            <StyledText className="text-3xl font-bold text-center mb-3">
                {title}
            </StyledText>
            <StyledText className="text-center text-lg mb-3">
                {subtitle}
            </StyledText>
            <StyledView>
                {content}
            </StyledView>
        </StyledView>
    )
}