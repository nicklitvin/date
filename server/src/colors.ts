import { SchoolColors } from "./interfaces";

const colors : [string, SchoolColors][] = [
    ["berkeley", {primary: "#003262", secondary: "#FDB515"}]
]   

export const schoolColors = new Map<string, SchoolColors>(colors);