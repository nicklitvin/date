import { AttributeType } from "@prisma/client";

export const allowedAttributeEdits : string[] = [
    "genderInterest", 
    "notifyOnMatch",
    "notifyOnMessage", 
    "description", 
    "ageInterest",
    "attributes",
    "alcohol",
    "smoking",
    "images"
];

export function isAdmin(key : string) {
    return process.env.ADMIN_API_KEY! == key;
}

export function isWebCheckoutKey(key : string) {
    return process.env.WEB_CHECKOUT_KEY! == key;
}

export const attributeList : Record<AttributeType, string[]>= {
    Fitness: [
        "Volleyball",
        "Soccer",
        "Basketball",
        "Tennis",
        "Baseball",
        "American Football",
        "Swimming",
        "Running",
        "Cycling",
        "Gymnastics",
        "Golf",
        "Boxing",
        "Hockey",
        "Cricket",
        "Badminton",
        "CrossFit",
        "Dance",
        "Weightlifting",
        "Pilates"
    ],
    Music: [
        "Pop",
        "Rap",
        "Country",
        "R&B",
        "Rock",
        "Hip-Hop",
        "Jazz",
        "Classical",
        "EDM",
        "Latin",
        "K-Pop",
        "Indie",
    ],
    Food: [
        "Italian",
        "Chinese",
        "Mexican",
        "Indian",
        "Japanese",
        "Mediterranean",
        "Thai",
        "French",
        "Greek",
        "Korean",
        "Spanish",
        "American",
        "Vegan",
        "Seafood",
        "BBQ"
    ],
    Movies: [
        "Action",
        "Horror",
        "Comedy",
        "Drama",
        "Sci-Fi",
        "Romance",
        "Thriller",
        "Fantasy",
        "Animation",
        "Documentary",
        "Mystery",
        "Crime"
    ],
    Outdoor: [
        "Hiking",
        "Camping",
        "Fishing",
        "Rock Climbing",
        "Kayaking",
        "Surfing",
        "Skiing",
        "Snowboarding",
        "Mountain Biking",
        "Backpacking",
        "Stand-Up Paddleboarding",
        "Ice Skating",
        "Skydiving",
        "Road Trips",
        "Sight Seeing"
    ],
    Indoor: [
        "Board Games",
        "Online Games",
        "Movies",
        "Cooking",
        "Baking",
        "Crafting",
        "Knitting",
        "Drawing",
        "Reading",
        "Writing",
        "Painting",
    ],
    Personality: [
        "Extrovert",
        "Introvert",
        "Adventerous",
        "Minimalist",
        "Organized",
        "Tech-savvy",
        "Laid-back",
        "Spontaneous",
        "Eco-friendly",
    ]
}