export const userRestrictions = {
    minAge : 18,
    maxAge : 150,
    maxInterestedIn : 2,
    maxAttributes : 5,
    minImagesCount : 1,
    maxImagesCount : 6,
    acceptaleImageFormats : ["image/jpeg","image/png"],
    maxNameLength : 16,
    maxDescriptionLength : 100,
}

export const eloConstants = {
    start: 1000,
    diffToMaxChange: 200,
    maxChangeFromLike: 20,
    maxChangeFromMessage: 2,
    maxChangeFromSubscribe: 200,
}

export const sampleContent = {
    uni: "lovedu",
    email: "quest.throwaway.acc@gmail.com",
    eduEmail: "quest.throwaway.acc@lovedu.edu",
    userID: "userID",
    code: 1234,
    messages: [
        "hi", 
        "hey", 
        "this is a very long message so dont mind the fact that it is going to be on multiple lines", 
        "also the goal is to make this so long that you have to scroll to the top and load more messages",
        "if this is done correctly, you will be able to scroll a bit higher",
        "and if not then its time to go back to debugging",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
        "spam",
    ],
}

export const displayText = {
    notification: "Notifications",
    newMatchNotificationTItle: "New Match!",
    newMatchNotificationMessage: "Check out who it is",
}

export const miscConstants = {
    usersLoadedInPreview : 10,
    messagesLoadedInChat: 10,
    maxReportCount: 10,
    freeTrialDays: 7,
    usersInSwipeFeed: 10,
    verificationCodeLength: 4,
    verificationExpireMinutes: 5,
    keyExpirationWeeks: 10,
    notificationChannel: "default",
}

export const userSettings = {
    notification: "notifications",
    image: "images",
}

export const errorText = {
    notValidUser: "Not a valid user",
    cannotEditUser: "Cannot edit user",

    alreadySubscribed: "Cannot purchase subscription if already subscribed",
    userAlreadyExists: "User already exists",
    invalidUserInput: "Invalid user input",
    userNotVerified: "User not verified",
    cannotSwipeSelf: "Cannot swipe self",
    cannotSwipeAgain: "Cannot swipe again",
    cannotSendMessage: "Cannot send message",
    cannotReportSelf: "Cannot report self",
    cannotReportAgain: "Cannot report again",
    tooManyImages: "Cannot upload more than 6 images",
    invalidImageFormat: "Invalid image format",
    errorWithUpload: "Error with upload. Try again.",
    imageDoesNotExist: "Image does not exist",
    cannotDeleteOnlyImage: "Cannot have 0 images",
    cannotDeleteImage: "Cannot delete image",
    invalidUserSetting: "Invalid user setting",
    invalidImageOrder: "Invalid image order",
}