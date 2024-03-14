import { useStore } from "../src/store/RootStore";
import { StyledText, StyledView } from "../src/styledElements";

export default function Index() {
    const { globalState } = useStore();

    return (
        <StyledView className="pt-20 bg-red-500">
            <StyledText className="font-bold">
                {globalState.timeZone}
            </StyledText>
        </StyledView>
    )
}