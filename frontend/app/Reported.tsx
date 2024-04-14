import { MySimplePage } from "../src/components/SimplePage";
import { reportedText } from "../src/text";

export default function Reported() {
    return <MySimplePage
        title={reportedText.pageTitle}
        subtitle={reportedText.pageSubtitle}
    />
}