import { MySimplePage } from "../components/SimplePage";
import { errorText } from "../text";

export function ErrorPage() {
    return (
        <MySimplePage
            title={errorText.title}
            subtitle={errorText.subtitle}
            content={null}
        />
    )
}