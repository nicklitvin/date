import { observer } from "mobx-react-lite";
import { AccountCreationMob } from "./AccountCreation";
import { useStore } from "../store/RootStore";
import { ErrorPage } from "./Error";

export function Home() {
    const { globalState } = useStore();

    let content : React.JSX.Element;

    switch(globalState.appPage) {
        case "Account Creation":
            content = <AccountCreationMob/>
            break;
        case "Tabs":
            break;
        default:
            content = <ErrorPage/>
            break;
    }

    return content!;
}

export const HomeMob = observer(Home);