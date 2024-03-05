/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.tsx"],
    theme: {
        extend: {
            fontSize: {
                "title": "text-3xl",
                "subtitle": "text-xl",
                "other": "text-lg",
                "small": "text-base"
            },
            colors: {
                "back": "#F3F0E7",
                "front": "#222222",
                "danger": "#B81515"
            }
        },
    },
    plugins: [],
}

