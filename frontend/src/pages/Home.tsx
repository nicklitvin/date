import { observer } from "mobx-react-lite";
import { AccountCreationMob } from "./AccountCreation";
import { useStore } from "../store/RootStore";
import { ErrorPage } from "./Error";

export function Home() {
    return (<></>)
}

export const HomeMob = observer(Home);