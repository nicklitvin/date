import { addHours } from "date-fns";
import { Announcement, ChatPreview, ClientIDs, Message, NewMatchData, Preferences, PublicProfile, SettingData, SubscriptionData, SwipeFeed, UserSwipeStats } from "./interfaces";

export const sampleProfile : PublicProfile = {
    name: "Michael",
    age: 21,
    attributes: ["Soccer", "Pop"],
    description: "this is a desceiption askdh askdjh aks dhsk ds dkas daksj daks kad jhask dajsh kasdhjasdhask das dhaskd ask dashd ",
    gender: "Male",
    id: "abc",
    images: [
        {
            id: "image1",
            url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
        }, 
        {
            id: "image2",
            url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
        },
    ],
    alcohol: "Often",
    smoking: "Often",
}

export const sampleSubscribed : SubscriptionData = {
    ID: "ID",
    subscribed: true,
    endDate: new Date(2025,0,1)
}

export const sampleStats : UserSwipeStats = {
    allTime: {
        likedMe: 10,
        dislikedMe: 20,
        myDislikes: 30,
        myLikes: 40
    },
    weekly: [
        {
            dislikedMe: 10,
            likedMe: 20,
            myDislikes: 30,
            myLikes: 40
        },
        {
            dislikedMe: 40,
            likedMe: 30,
            myDislikes: 20,
            myLikes: 10
        },
        {
            dislikedMe: 30,
            likedMe: 40,
            myDislikes: 10,
            myLikes: 20
        },
        {
            dislikedMe: 20,
            likedMe: 10,
            myDislikes: 40,
            myLikes: 30
        },
    ]
}

export const sampleNewMatches : NewMatchData[] = [
    {
        profile: {
            name: "Not Michael",
            age: 25,
            attributes: ["basketball"],
            description: "this is not michael",
            gender: "Female",
            id: "goat",
            images: [
                {
                    id: "image1",
                    url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                }, 
                {
                    id: "image2",
                    url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                },
            ],
            alcohol: "Never",
            smoking: "Never",
        },
        timestamp: new Date(2000, 0, 1)
    }
]

export const sampleChatPreviews : ChatPreview[] = [
    {
        profile: {
            name: "Not Michael 2",
            age: 25,
            attributes: ["basketball"],
            description: "this is not michael",
            gender: "Female",
            id: "goat",
            images: [
                {
                    id: "image1",
                    url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                }, 
                {
                    id: "image2",
                    url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                },
            ],
            alcohol: "Never",
            smoking: "Never",
        },
        message: {
            id: "asd",
            message: "hi",
            readStatus: false,
            recepientID: "asd",
            timestamp: new Date(2000,0,1),
            userID: "Me"
        }
    }
]

export const sampleSavedChat : Message[] = Array.from({ length : 20}, (_,index) => ({
    id: String(Math.random()),
    message: String(Math.random()),
    readStatus: true,
    recepientID: "id",
    userID: "goat",
    timestamp: new Date()
}))

export const sampleSwipeFeed : SwipeFeed = {
    profiles: [
        {
            name: "Not Michael 2",
            age: 25,
            attributes: ["basketball"],
            description: "this is not michael",
            gender: "Female",
            id: "goat",
            images: [
                {
                    id: "image1",
                    url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                }, 
                {
                    id: "image2",
                    url: "https://pbs.twimg.com/profile_images/1262372966073016321/DH4rOj9S_400x400.jpg"
                },
            ],
            alcohol: "Never",
            smoking: "Never",
        },
        {
            name: "Not Michael 3",
            age: 35,
            attributes: ["basketball"],
            description: "this is not michael again",
            gender: "Female",
            id: "asdqwe",
            images: [
                {
                    id: "image1",
                    url: "https://hips.hearstapps.com/hmg-prod/images/jordan-jamming-1589896458.png?crop=0.564xw:1.00xh;0.0545xw,0&resize=1200:*"
                }, 
            ],
            alcohol: "Often",
            smoking: "Often",
        }
    ],
    likedMeIDs: []
}

export const sampleAnnouncements : Announcement[] = [
    {
        id: "qwejqwle",
        startTime: addHours(new Date(), -1),
        endTime: addHours(new Date(), 1),
        message: "this is a short message",
        title: "Title"
    }, 
    {
        id: "qwejqwlweqe",
        startTime: addHours(new Date(), -1),
        endTime: addHours(new Date(), 1),
        message: "this is a very long message and it might be worth to have some kind of splits in the text such as with the new line character so that it is not just a huge and massive block of text",
        title: "Title 2"
    }
]

export const sampleSettings : SettingData[] = [
    {
        title: "Title",
        display: "Display",
        value: true
    }
]

export const sampleClientIDs : ClientIDs = {
    android: "sample",
    expo: "sample",
    ios: "sample"
}

export const sampleAttributes : {[type : string] : string[]} = {
    "Sports": ["Volleyball", "Soccer"],
    "Music": ["Pop", "Country"]
}

export const samplePreferences : Preferences = {
    agePreference: [20,28],
    genderPreference: ["Male"]
}