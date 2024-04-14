"use client"
const text = {
    title: "Lovedu",
    subtitle: "An online dating platform aimed at students with features to help improve performance without predatory tactics",
}

export default function Home() {
    return (
        <div className="flex flex-col gap-5 p-5 items-center">
            <h1 className="text-3xl font-bold text-center w-full mt-[250px]">
                {text.title}
            </h1> 
            <h2 className="text-xl text-center">
                {text.subtitle}
            </h2>
            <div className="h-8"/>
        </div>
    )
}
