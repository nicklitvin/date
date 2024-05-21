"use client"
interface Props {
    text: string
    func: () => any
}

export function Button(props : Props) {
    return (
        <button 
            className="border border-front w-3/5 rounded-[50px] px-10 py-3 shadow-xl active:opacity-50"
            onClick={props.func}
        >
            {props.text}
        </button>
    )
}
