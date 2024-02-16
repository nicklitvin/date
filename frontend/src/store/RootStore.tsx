import { createContext, useContext } from "react";
import { GlobalState } from "./globalState";

export class RootStore {
    public globalState : GlobalState;

    constructor() {
        this.globalState = new GlobalState();
    }
}

export const createRootInstance = () => new RootStore();

const StoreContext = createContext(createRootInstance());
export const StoreProvider = StoreContext.Provider;
export const useStore = () => useContext(StoreContext);

