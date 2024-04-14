interface Props {
    text: string
}

export function Title(props : Props) {
    return (
        <h1 className="w-full text-3xl font-bold text-center">
            {props.text}
        </h1>
    )
}