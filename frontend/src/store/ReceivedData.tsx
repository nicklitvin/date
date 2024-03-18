import { action, observable } from "mobx";
import { ChatPreview, Message, NewMatch, PublicProfile, SubscriptionData, SwipeFeed, SwipeStatus, UserSwipeStats } from "../interfaces";

export class ReceivedData {
    @observable public profile : PublicProfile|null = null;
    @observable public subscription : SubscriptionData|null = null;
    @observable public chatPreviews : ChatPreview[] = [];
    @observable public swipeFeed : SwipeFeed|null = null;
    @observable public swipeStatus : SwipeStatus|null = null;
    @observable public stats : UserSwipeStats|null = null;
    @observable public newMatches : NewMatch[] = [];
    @observable public savedChats : {[userID: string] : Message[]} = {}

    @action
    setProfile(input : PublicProfile) {this.profile = input; }

    @action
    setSubscription(input : SubscriptionData) {this.subscription = input; }

    @action
    setChatPreviews(input : ChatPreview[]) { this.chatPreviews = input; }

    @action
    setSwipeFeed(input : SwipeFeed) { this.swipeFeed = input; }

    @action 
    setStats(input : UserSwipeStats|null) { this.stats = input; }

    @action 
    setNewMatches(input : NewMatch[]) { this.newMatches = input; }

    @action
    addSavedChat(userID : string, chat : Message[]) { 
        this.savedChats[userID] = chat
    }

    @action
    setSwipeStatus(input : SwipeStatus) { this.swipeStatus = input; }
}