import { action, observable } from "mobx";
import { Attributes, ChatPreview, clientIDs, Message, NewMatch, Preferences, PublicProfile, SettingData, SubscriptionData, SwipeFeed, SwipeStatus, UserSwipeStats } from "../interfaces";
import { globals } from "../globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ReceivedData {
    @observable public profile : PublicProfile|null = null;
    @observable public subscription : SubscriptionData|null = null;
    @observable public chatPreviews : ChatPreview[]|null = null;
    @observable public newMatches : NewMatch[]|null = null;
    @observable public swipeFeed : SwipeFeed|null = null;
    @observable public swipeStatus : SwipeStatus|null = {
        feedIndex: 0,
        lastSwipedIndex: -1
    };
    @observable public stats : UserSwipeStats|null = null;
    @observable public savedChats : {[userID: string] : Message[]} = {}
    @observable public settings : SettingData[]|null = null;
    @observable public preferences : Preferences|null = null;
    @observable public clientIDs : clientIDs|null = null;
    @observable public loginKey : string|undefined = undefined;
    @observable public attributes : Attributes = {};

    @action
    setProfile(input : PublicProfile|null) {this.profile = input; }

    @action
    setSubscription(input : SubscriptionData) {this.subscription = input; }

    @action
    setChatPreviews(input : ChatPreview[]|null) { this.chatPreviews = input; }

    @action
    setSwipeFeed(input : SwipeFeed|null) { this.swipeFeed = input; }

    @action 
    setStats(input : UserSwipeStats|null) { this.stats = input; }

    @action 
    setNewMatches(input : NewMatch[]|null) { this.newMatches = input; }

    @action
    addSavedChat(userID : string, chat : Message[]) { 
        this.savedChats[userID] = chat
    }

    @action
    deleteSavedChat(userID : string) {
        delete this.savedChats[userID]
    }

    @action
    setSwipeStatus(input : SwipeStatus) { this.swipeStatus = input; }

    @action
    setSettings(input : SettingData[]) { this.settings = input; }

    @action
    setPreferences(input : Preferences) { this.preferences = input; }

    @action
    setClientIDs(input : clientIDs ) { this.clientIDs = input; }

    @action
    setLoginKey(input : string|undefined) { 
        this.loginKey = input; 
        AsyncStorage.setItem(globals.storageloginKey, input ?? "");
    }

    @action
    setAttributes(input : Attributes) { this.attributes = input; }
}