import { observer } from "mobx-react-lite";
import { AccountCreationMob } from "./AccountCreation";

export function Home() {
    return (
        <AccountCreationMob/>
    )
}

export const HomeMob = observer(Home);