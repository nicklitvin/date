import { action, makeAutoObservable, observable } from "mobx";

export class GlobalState {
    @observable public useHttp : boolean = true;
    @observable public email : string|null = null;
    @observable public timeZone : string = "America/Los_Angeles";

    constructor() {
        makeAutoObservable(this);
    }

    @action
    setUseHttp(value : boolean) { this.useHttp = value; }

    @action
    setEmail(value : string|null) { this.email = value; }

    @action
    setTimezone(value : string) { this.timeZone= value; }
}