import { action, makeAutoObservable, observable } from "mobx";
import { Attributes, ChatPreview, ClientIDs, LoginOutput, Message, NewMatchData, Preferences, PublicProfile, SettingData, SubscriptionData, SwipeFeed, SwipeStatus, UserSwipeStats } from "../interfaces";
import { globals } from "../globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ReceivedData {
    @observable public profile : PublicProfile|null = null;
    @observable public subscription : SubscriptionData|null = null;
    @observable public chatPreviews : ChatPreview[]|null = null;
    @observable public newMatches : NewMatchData[]|null = null;
    @observable public swipeFeed : SwipeFeed|null = null;
    @observable public stats : UserSwipeStats|null = null;
    @observable public savedChats : {[userID: string] : Message[]} = {}
    @observable public settings : SettingData[]|null = null;
    @observable public preferences : Preferences|null = null;
    @observable public clientIDs : ClientIDs|null = null;
    @observable public loginKey : string|undefined = undefined;
    @observable public attributes : Attributes = {};

    constructor() {
        makeAutoObservable(this);
    }

    @action
    setProfile(input : PublicProfile|null) { this.profile = input; }

    @action
    setSubscription(input : SubscriptionData|null) {this.subscription = input; }

    @action
    setChatPreviews(input : ChatPreview[]|null) { this.chatPreviews = input; }

    @action
    setSwipeFeed(input : SwipeFeed|null) { this.swipeFeed = input; }

    @action 
    setStats(input : UserSwipeStats|null) { this.stats = input; }

    @action 
    setNewMatches(input : NewMatchData[]|null) { this.newMatches = input; }

    @action
    addSavedChat(userID : string, chat : Message[]) {
        const chats = {...this.savedChats};
        chats[userID] = chat;
        this.savedChats = chats;
    }

    @action
    deleteSavedChat(userID : string) {
        const chats = {...this.savedChats};
        delete chats[userID] 
        this.savedChats = chats;
    }

    @action
    deleteMessageFromChat(withID : string, messageID : string) {
        const chatCopy = [...this.savedChats[withID]];
        const newCopy = chatCopy.filter( val => val.id != messageID);

        const chats = {...this.savedChats};
        chats[withID] = newCopy;
        this.savedChats = chats;
    }

    @action
    setSettings(input : SettingData[]) { this.settings = input; }

    @action
    setPreferences(input : Preferences) { this.preferences = input; }

    @action
    setClientIDs(input : ClientIDs ) { this.clientIDs = input; }

    @action
    setLoginKey(input : string|undefined) { 
        this.loginKey = input; 
        AsyncStorage.setItem(globals.storageloginKey, input ?? "");
    }

    @action
    setAttributes(input : Attributes) { this.attributes = input; }
}