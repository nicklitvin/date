import { action, makeAutoObservable, observable } from "mobx";
import { GetChatInput, MessageInput, NewMatchDataInput, RequestReportInput, SwipeInput, UserInput } from "../interfaces";

export class SavedAPICalls {
    @observable public createUser : UserInput|null = null;
    @observable public sentMessage : MessageInput|null = null;
    @observable public getChatInput : GetChatInput|null = null;
    @observable public requestReportInput : RequestReportInput|null = null;
    @observable public newMatchDataInput: NewMatchDataInput|null = null;
    @observable public swipeInput : SwipeInput|null = null;
    @observable public getFeed : boolean|null = null;

    constructor() {
        makeAutoObservable(this)
    }

    @action 
    setGetFeed(input : boolean) { this.getFeed = true; }

    @action 
    setSwipeInput(input : SwipeInput) { this.swipeInput = input; }
    
    @action
    setNewMatchDataInput(input : NewMatchDataInput) { this.newMatchDataInput = input; }

    @action
    setRequestReportInput(input: RequestReportInput) { this.requestReportInput = input; }

    @action
    setGetChatInput(input : GetChatInput) { this.getChatInput = input; }

    @action
    setSentMessage(input : MessageInput) { this.sentMessage = input; }

    @action
    setCreateUser(input : UserInput) { this.createUser = input }
}