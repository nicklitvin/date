/* eslint-disable @next/next/no-img-element */
"use client"
import { Title } from "../_components/Title";
import { Button } from "../_components/Button";

const text = {
    title: "Lovedu Premium",
    subtitle: 
`Getting matches is not easy for everyone, but we provide you with data and advice that could help you get out of this situation

Here is a list of benefits that you will receive upon purchasing the premium service`,
    sectionSwipe: "Swipe Breakdown",
    sectionAddition: "In addition to...",
    additionText: `Increased exposure to other users`,
    purchaseButton: "Purchase Premium for $6.99/month",
    smallText: 
`Premium will be $6.99/month to all users. Managing your subscription and viewing statistics are actions that can be done through the mobile app. Upon cancellation of the subscription the user will continue to receive all of the listed benefits until the end of the billing month but will notice an immediate lower exposure of their profile to other users to counteract the increase made at the beginning of the subscription.`,
    smallTextHeader: "Additional Notes",
}

interface TextProp {
    text: string
}
function SectionTitle(props : TextProp) {
    return <h1 className="text-2xl font-bold w-full text-center py-3">{props.text}</h1>
}

function ChartTitle(props : TextProp) {
    return <h1 className="text-xl font-bold">{props.text}</h1>
}

function TextBlock(props : TextProp) {
    return (
        <h1 className="text-lg text-center whitespace-pre-wrap">
            {props.text}
        </h1>
    )
}

export default function Premium() {
    const redirectToPremium = async () => {
        return
    }

    return (
        <div className="flex flex-col gap-3">
            <Title text={text.title}/>
            <TextBlock text={text.subtitle}/>
            <SectionTitle text={text.sectionSwipe}/>
            <ChartTitle text="All Time"/>
            <div className="flex w-full flex-row items-center">
                <img
                    src="pie.png"
                    alt="Pie"
                    className="w-[100px] h-[100px]"
                />
                <div className="flex flex-col pl-10">
                    <p className="text-base">
                        {`81 Likes Received`}
                    </p>
                    <p className="text-base">
                        {`94 Dislikes Received`}
                    </p>
                    <p className="text-base">
                        {`Ratio: 43%`}
                    </p>
                </div>
            </div>
            <ChartTitle text="Weekly"/>
            <div className="w-full">
                <img
                    src="weekly.png"
                    alt="weekly"
                    className="w-[300px] h-[150px]"
                />
                <p className="text-xl font-bold">
                    {`Jan. 1 - Jan. 6`}
                </p>
                <p className="text-base">
                    {`24 Likes Received`}
                </p>
                <p className="text-base">
                    {`28 Dislikes Received`}
                </p>
                <p className="text-base">
                    {`Ratio: 46%`}
                </p>
            </div>
            <SectionTitle text={text.sectionAddition}/>
            <TextBlock text={text.additionText}/>
            <div className="flex flex-col w-full items-center">
                <Button
                    func={redirectToPremium}
                    text={text.purchaseButton}
                />
            </div>
            <p className="text-sm font-bold text-center mt-3">{text.smallTextHeader}</p>
            <p className="text-xs text-center">
                {text.smallText}
            </p>
        </div>
    )
}