import { action, makeAutoObservable, observable } from "mobx";

export class GlobalState {
    @observable public useHttp : boolean = true;
    @observable public email : string|null = null;
    @observable public timeZone : string = "America/Los_Angeles";
    @observable public ignoreRequest : boolean = true;
    @observable public disableFade : boolean = false;
    @observable public expoPushToken : string|null = null;

    constructor() {
        makeAutoObservable(this);
    }

    @action
    setUseHttp(value : boolean) { this.useHttp = value; }

    @action
    setEmail(value : string|null) { this.email = value; }

    @action
    setTimezone(value : string) { this.timeZone = value; }

    @action 
    setIgnoreRequest(value : boolean) { this.ignoreRequest = value; }

    @action
    setDisableFade(value : boolean) { this.disableFade = value; }

    @action
    setExpoPushToken(value : string) { this.expoPushToken = value; }
}