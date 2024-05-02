import { action, makeAutoObservable, observable } from "mobx";
import { SwipeStatus } from "../interfaces";
import { SocketManager } from "../components/SocketManager";

export class GlobalState {
    @observable public useHttp : boolean = true;
    @observable public timeZone : string = "America/Los_Angeles";
    @observable public ignoreRequest : boolean = true;
    @observable public disableFade : boolean = false;
    @observable public expoPushToken : string|null = null;
    @observable public swipeStatus : SwipeStatus|null = null;
    @observable public socketManager : SocketManager|null = null;
    @observable public unsentMessageIDs : Set<string> = new Set();
    @observable public loadingMessageIDs : Set<string> = new Set();

    constructor() {
        makeAutoObservable(this);
    }

    @action
    addUnsentMessageID(input : string) { this.unsentMessageIDs = new Set([...this.unsentMessageIDs, input]); }

    @action
    removeUnsentMessageID(input : string) {
        const copy = new Set([...this.loadingMessageIDs]);
        copy.delete(input);
        this.unsentMessageIDs = copy;
    }

    @action
    addLoadingMessageID(input : string) { this.loadingMessageIDs = new Set([...this.loadingMessageIDs, input])}

    @action
    removeLoadingMessageID(input : string) { 
        const copy = new Set([...this.loadingMessageIDs]);
        copy.delete(input);
        this.loadingMessageIDs = copy;
    }

    @action
    setSocketManager(input : SocketManager|null) { this.socketManager = input; }

    @action
    setSwipeStatus(input : SwipeStatus) { this.swipeStatus = input; }

    @action
    resetSwipeStatus() { this.swipeStatus = {
        feedIndex: 0,
        lastSwipedIndex: -1
    }}

    @action
    setUseHttp(value : boolean) { this.useHttp = value; }

    @action
    setTimezone(value : string) { this.timeZone = value; }

    @action 
    setIgnoreRequest(value : boolean) { this.ignoreRequest = value; }

    @action
    setDisableFade(value : boolean) { this.disableFade = value; }

    @action
    setExpoPushToken(value : string) { this.expoPushToken = value; }
}