
const text = {
    title: "Payment successful",
    subtitle: "You may now return to the app and view your benefits"
}

export default function Success() {
    return (
        <div className="flex flex-col gap-5 p-5 items-center mt-[250px] ">
            <h1 className="text-3xl font-bold text-center w-full">
                {text.title}
            </h1> 
            <h2 className="text-xl text-center">
                {text.subtitle}
            </h2>
            <div className="h-8"/>
        </div>    
    )
}