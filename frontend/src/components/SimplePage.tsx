import classNames from "classnames";
import { StyledText, StyledView } from "../styledElements";
import { styles } from "../styles";

interface Props {
    title: string
    subtitle: string
    content: any,
    customClass?: string
}

export function MySimplePage(props : Props) {
    return (
        <StyledView className={classNames(
            props.customClass ?? `mt-[200px] h-[400px] flex flex-col`
        )}>
            <StyledText className={`${styles.titleText} font-bold text-center mb-5`}>
                {props.title}
            </StyledText>
            <StyledText className={`${styles.subtitleText} text-center mb-5`}>
                {props.subtitle}
            </StyledText>
            <StyledView className="flex-1"/>
            {props.content}
        </StyledView>
    )
}