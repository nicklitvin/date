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
    allowedAttributeEdits: ["age"], 

    // Other
    usersLoadedInPreview : 10,
    messagesLoadedInChat: 10,
    maxReportCount: 10,
}

// import { AttributeType } from "@prisma/client",

// matchPreviewMessageCount : 10,
// reportsForBan : 10,
// maxProfileImageCount : 6,

// userAttributes : {[type in AttributeType] : string[]} : {
//     "Fitness": [
//         "Basketball",
//         "Soccer",
//         "Football"
//     ],
//     "Music": [
//         "Pop",
//         "Hip-Hop",
//         "R&B"
//     ]
// }