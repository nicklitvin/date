import { useState } from "react"
import { MyButton } from "./Button";

interface Props {
    saveImages: () => void
    afterSubmit: Function
}

export function Uploadlist(props : Props) {
    const [imageURIs, setImageURIs] = useState<string[]>([]);

    return
}