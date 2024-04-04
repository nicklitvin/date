export const globals = {
    // User Restrictions
    minAge : 18,
    maxAge : 150,
    maxInterestedIn : 2,
    maxAttributes : 5,
    minImagesCount : 1,
    maxImagesCount : 6,
    acceptaleImageFormats : ["image/jpeg","image/png"],
    maxNameLength : 16,
    maxDescriptionLength : 100,

    // elo
    eloStart: 1000,
    eloDiffToMaxChange: 200,
    eloLikeMaxChange: 20,
    eloMessageMaxChange: 2,
    eloLoginMaxChange: 0.5,
    eloSubscribeMaxChange: 200,

    // Other
    usersLoadedInPreview : 10,
    messagesLoadedInChat: 10,
    maxReportCount: 10,
    freeTrialDays: 7,
    usersInSwipeFeed: 10,
    verificationCodeLength: 4,
    verificationExpireMinutes: 5,
    keyExpirationWeeks: 10,
    notificationSetting: "notifications",
    notificationDisplayTitle: "Notifications",
    notificationChannel: "default",
    newMatchNotifTitle: "New Match!",
    newMatchMessage: "Check out who it is",
    imageSetting: "images",

    // Sample
    sampleUniversity: "lovedu",
    sampleEmail: "quest.throwaway.acc@gmail.com",
    sampleSchoolEmail: "quest.throwaway.acc@lovedu.edu",
    sampleUserID: "sampleUserID",
    sampleVerificationCode: 1234,
    sampleMessages: [
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

    //URLS
    googleOAuth: "https://www.googleapis.com/userinfo/v2/me",
}