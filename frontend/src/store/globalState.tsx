import { action, makeAutoObservable, observable } from "mobx";
import { UserInput } from "../interfaces";

export class GlobalState {
    @observable public useHttp : boolean = true;
    @observable public email : string|null = null;
    @observable public userInput : UserInput|null = null;

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
}