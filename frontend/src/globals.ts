export const globals = {
    genders: ["Male", "Female"],
    minAge: 18,
    maxAge: 99,
    maxUploads: 6,
    timeBeforeChatTimestamp: 1000 * 60 * 60,

    attributes: {
        "Sports": [
            {id: "id", value: "soccer"},
            {id: "id2", value: "basketball"},
        ],
        "Music": [
            {id: "id3", value: "pop"},
            {id: "id4", value: "rap"},
        ]
    },

    URLServer: "http:",
    URLCreateUser: "/createUser",
    URLSendMessage: "/sendMessage",
    URLGetChat: "/getChat",
    URLReportUser: "/reportUser"
}