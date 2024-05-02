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
    @observable public socketUser : SocketManager|null = null;

    constructor() {
        makeAutoObservable(this);
    }

    @action
    setSocketManager(input : SocketManager|null) { this.socketUser = input; }

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