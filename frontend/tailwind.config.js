/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.tsx"],
    theme: {
        extend: {
            colors: {
                "back": "#F3F0E7",
                "front": "#222222",
                "danger": "#B81515"

                // "primary": "#222222",
                // "background": "#F3F0E7",
                // "green": "#4A991A",
                // "red": "#B81515"
            }
        },
    },
    plugins: [],
}

