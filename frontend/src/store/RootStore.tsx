import { createContext, useContext } from "react";
import { GlobalState } from "./globalState";

export class RootStore {
    public globalState : GlobalState;

    constructor() {
        this.globalState = new GlobalState();
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
