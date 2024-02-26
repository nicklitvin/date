import { createContext, useContext } from "react";
import { GlobalState } from "./globalState";
import { ReceivedData } from "./ReceivedData";

export class RootStore {
    public globalState : GlobalState;
    public receivedData : ReceivedData;

    constructor() {
        this.globalState = new GlobalState();
        this.receivedData = new ReceivedData();
    }
}

let context : React.Context<RootStore>;

export function createStoreProvider(store : RootStore) {
    context = createContext(store);
    return context.Provider
}

export function useStore() {
    return useContext(context);
}
