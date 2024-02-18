import { action, makeAutoObservable, observable } from "mobx";
import { MessageInput, RequestReportInput, UserInput } from "../interfaces";
import { AppPage } from "../types";

export class GlobalState {
    @observable public useHttp : boolean = true;
    @observable public email : string|null = null;
    @observable public userInput : UserInput|null = null;
    @observable public appPage : AppPage = "Account Creation";
    @observable public sentMessage : MessageInput|null = null;
    @observable public userID : string|null = null;
    @observable public lastReport : RequestReportInput|null = null;
    @observable public timeZone : string|null = "";

    constructor() {
        makeAutoObservable(this);
    }

    @action
    setUseHttp(value : boolean) {
        this.useHttp = value;
    }

    @action
    setEmail(value : string|null) {
        this.email = value;
    }

    @action
    setUserInput(input : UserInput) {
        this.userInput = input;
    }

    @action
    setAppPage(value : AppPage) {
        this.appPage = value;
    }

    @action
    setSentMessage(value : MessageInput) {
        this.sentMessage = value;
    }

    @action
    setUserID(value : string) {
        this.userID = value;
    }

    @action
    setLastReport(value : RequestReportInput) {
        this.lastReport = value;
    }

    @action
    setTimezone(value : string) {
        this.timeZone= value;
    }
}