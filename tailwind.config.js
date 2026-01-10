/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Manual toggle strategy
    theme: {
        extend: {
            colors: {
                cream: '#FDFCF0',
                mint: '#D8F3DC',
                rose: '#FFD6D6',
                lavender: '#E2E0FF',

                // Dark Mode
                'dark-bg': '#2D1E1A', // Dark Chocolate
                'dark-text-main': '#EDE0D4',
                'dark-text-muted': '#D7CCC8',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-medium': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(5deg)' },
                    '50%': { transform: 'translateY(-30px) rotate(-5deg)' },
                },
                'float-fast': {
                    '0%, 100%': { transform: 'translateY(0px) scale(1)' },
                    '50%': { transform: 'translateY(-15px) scale(1.1)' },
                },
                'spin-slow': {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' },
                },
                melt: {
                    '0%, 100%': { transform: 'scaleY(1)' },
                    '50%': { transform: 'scaleY(1.1)' },
                },
                'wave-flow': {
                    '0%, 100%': { transform: 'translateY(0) scaleY(1)' },
                    '50%': { transform: 'translateY(5px) scaleY(1.02)' },
                }
            },
            animation: {
                'float-slow': 'float 6s ease-in-out infinite',
                'float-medium': 'float-medium 5s ease-in-out infinite',
                'float-fast': 'float-fast 4s ease-in-out infinite',
                'spin-slow': 'spin-slow 20s linear infinite',
                'melt': 'melt 6s ease-in-out infinite',
                'wave-flow': 'wave-flow 5s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}
