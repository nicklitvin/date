import { action, observable } from "mobx";
import { ChatPreview, PublicProfile, SubscriptionData } from "../interfaces";

export class ReceivedData {
    @observable public profile : PublicProfile|null = null;
    @observable public subscription : SubscriptionData|null = null;
    @observable public chatPreviews : ChatPreview[]|null = null;
    @observable public swipeFeed : PublicProfile[]|null = null;

    @action
    setProfile(input : PublicProfile) {this.profile = input; }

    @action
    setSubscription(input : SubscriptionData) {this.subscription = input; }

    @action
    setChatPreviews(input : ChatPreview[]) { this.chatPreviews = this.chatPreviews; }

    @action
    setSwipeFeed(input : PublicProfile[]) { this.swipeFeed = input; }
}