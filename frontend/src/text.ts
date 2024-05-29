import { globals } from "./globals"

export const errorText = {
    title: "Error",
    subtitle: "Something went wrong"
}

export const chatText = {
    inputPlaceholder: "Type your message here",
    inputError: "Cannot send message",
    read: "read",
    delivered: "delivered",
    unsent: "unsent",
    sending: "sending...",
    modalTitle: "What would you like to do?",
    modalReport: "Report User",
    modalUnlike: "Unmatch User",
    sendFirst: "Send the first message :)",
    errorCannotSend: "Cannot send message",
}

export const matchesText = {
    newMatches: "New Matches",
    chats: "Chats",
    pageTitle: "Matches",
    noNewMatches: "No new matches",
    noChats: "No chats",
}

export const feedText = {
    pageTitle: "Feed",
    noMoreFeed: "No more people to see right now"
}

export const profileViewText = {
    pageTitle: "Public View",
    reportUser: "Report User",
    likedMe: "Likes you",
}

export const descriptionText = {
    pageTitle: "About You",
    pageSubtitle: "Run a fun description about yourself",
    inputPlaceholder: "Describe yourself here...",
    errorMessage: "Invalid Description",
}

export const myNameText = {
    pageTitle: "Name",
    pageSubtitle: "What do you want others to call you?",
    inputPlaceholder: "Type your name here...",
    inputError: "Invalid Name",
}

export const genderText = {
    pageTitle: "Gender",
    pageSubtitle: "What is your gender?",
    error: "Please select a gender",
}

export const createProfileText = {
    pageTitle: "Create Profile",
    pageSubtitle: "Time to show off your beautiful self, and you can change anything later so do not worry",
}

export const birthdayText = {
    pageTitle: "Age",
    pageSubtitle: "When is your birthday?",
    tooYoung: "You must be 18+",
}

export const generalText = {
    continue: "Continue",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    saved: "Saved",
    unknownError: "Unknown Error",
}

export const genderPreferenceText = {
    pageTitle: "Gender Preference",
    pageSubtitle: "Who would you like to see?",
    error: "Select at least one preference",
}

export const attributesText = {
    pageTitle: "Attributes",
    pageSubtitle: "Select some of your favorite interests",
    error: `Select between 1-${globals.maxAttributes} attributes`
}

export const agePreferenceText = {
    pageTitle: "Age Preference",
    pageSubtitle: "We will only show people within this range (inclusive)",
    inputError: "Invalid Age Range",
}

export const finalText = {
    pageTitle: "That's It!",
    pageSubtitle: "Ready to begin your journey",
    inputError: "Cannot create your profile"
}

export const pictureText = {
    pageTitle: "Images",
    pageSubtitle: "Upload pictures that show how awesome you are",
    uploadImageButton: "Add Pictures",
    uploadDocumentButton: "Add From Files",
    sizeError: "Images must be smaller than 5MB and JPG/PNG",
    noPicturesError: "Upload at least one picture",
    uploadError: "Upload Error",
}

export const eduEmailText = {
    pageTitle: "Edu Email",
    pageSubtitle: "What is your university email? It will only be used to send a 4-digit code for verification.",
    inputPlaceholder: "Type your university email here...",
    inputError: "Invalid email"
}

export const verifyCodeText = {
    pageTitle: "Verification",
    pageSubtitle: "Check your university email account, What is the 4 digit code?",
    inputPlaceholder: "Type the 4-digit code here...",
    inputError: "Invalid Code",
    resendButton: "Resend Code",
    resending: "Resend in"
}

export const editProfileText = {
    pageTitle: "Edit Profile",
    headerPictures: "Pictures",
    headerDescription: "Description",
    headerAttributes: "Attributes",
    descriptionPlaceholder: "Type your description here...",
    descriptionError: "Invalid Description",
    attributeButton: "Change Attributes",

    editImages: "Edit Images",
    editAttributes: "Edit Attributes",
    editOther: "Other",

    cannotUploadImage: "Cannot upload picture",
    cannotDeleteImage: "Cannot delete picture",
}

export const preferencesText = {
    pageTitle: "Preferences",
    headerGender: "Gender Preference",
    headerAgePreference: "Age Preference",
    selectGender: "Select at least 1 gender preference",
}

export const statsText = {
    pageTitle: "Stats",
    purchaseButton: "Purchase Premium",
    purchaseText: [
        "Want to see how many people like/dislike your profile?",
        "Want to see your improvement over the last few weeks?",
        "Want improved visibility of your profile?",
    ],
    allTimeReceived: "All Time Received",
    allTimeSent: "All Time Sent",
    weeklyReceived: "Weekly Received",
    weeklySent: "Weekly Sent",
    likesReceived: "likes received",
    dislikesReceived: "dislikes received",
    likesSent: "likes sent",
    dislikesSent: "dislikes sent",
    noRatio: "No Ratio",
}

export const profileText = {
    pageTitle: "Profile",
    viewProfile: "View Profile",
    editProfile: "Edit Profile",
    managePayment: "Manage Payment",
    cancelSubscription: "Cancel Subscription",
    subscriptionStatus: "Subscription Status",
    purchasePremium: "Purchase Premium",
    freeTier: "Free Tier",
    premiumTier: "Premium Tier",
    subscriptionCanceled: "Subscription canceled"
}

export const settingsText = {
    pageTitle: "Settings",
    signOut: "Sign Out",
    deleteAccount: "Delete Account",
    modalTitle: "Are you sure you want to delete your account?",
    modalDelete: "Confirm Delete",
    notificationsDisabledError: "Click to enable notifications in settings"
}

export const alcoholText = {
    pageTitle: "Alcohol",
    pageSubtitle: "How often do you drink?",
    error: "Please select frequency"
}

export const smokingText = {
    pageTitle: "Smoking",
    pageSubtitle: "How often do you smoke?",
    error: "Please select frequency"
}

export const signInText = {
    pageTitle: "Lovedu",
    pageSubtitle: "",
    googleSignIn: "Sign In With Google",
    terms: "Terms of Service",
    version: "V1.0.0"
}

export const noWifiText = {
    pageTitle: "No Network Connection",
    pageSubtitle: "Or the server is down for now",
    button: "Try Again",
}

export const loadText = {
    pageTitle: "Loading...",
    pageSubtitle: "Should not take too long"
}

export const reportedText = {
    pageTitle: "You have been banned!",
    pageSubtitle: "Your account has been suspended from this platform for not complying with our guidelines. If you believe this ban is unjustified, contact customer support."
}

export const announcementText = [
    "Sure. Whatever",
    "Got it! So boring",
    "Alright. Fine",
    "Sorry, don't care",
    "But did I ask?",
    "Don't care, skip!",
]