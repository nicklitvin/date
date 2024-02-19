import { createContext, useContext } from "react";
import { GlobalState } from "./globalState";
import { SavedAPICalls } from "./savedAPICalls";

export class RootStore {
    public globalState : GlobalState;
    public savedAPICalls : SavedAPICalls;

    constructor() {
        this.globalState = new GlobalState();
        this.savedAPICalls = new SavedAPICalls();
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
