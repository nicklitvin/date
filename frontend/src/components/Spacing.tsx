import classNames from "classnames"
import { StyledView } from "../styledElements"

interface Props {
    size: "sm" | "md" | "lg"
}

export function Spacing(props: Props) {
    return (
        <StyledView className={classNames(
            "w-full",
            props.size == "sm" ? "h-1" : (
                props.size == "md" ? "h-2" : "h-5"
            )
        )}/>
    )
}