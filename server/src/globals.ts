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
    notificationSetting: "Notifications",

    //URLS
    googleOAuth: "https://www.googleapis.com/userinfo/v2/me",
}