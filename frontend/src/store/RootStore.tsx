import { createContext, useContext } from "react";
import { SampleStore } from "./sampleStore";

export class RootStore {
    public counter : SampleStore;

    constructor() {
        this.counter = new SampleStore();
    }
}

export const createRootInstance = () => new RootStore();

const StoreContext = createContext(createRootInstance());
export const StoreProvider = StoreContext.Provider;
export const useStore = () => useContext(StoreContext);