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
                cream: '#FAF7F2',
                'cream-elevated': '#F2ECE2',
                paper: '#FAF7F2',
                'paper-card': '#FFFFFF',
                'paper-border': '#E6DED2',
                espresso: '#231A14',
                'espresso-muted': '#6B5E52',
                'amber-treat': '#D97706',
                'amber-soft': '#FEF3C7',
                'sage-reward': '#2E7D32',
                'sage-soft': '#DCFCE7',
                'crimson-lapse': '#C62828',
                'crimson-soft': '#FEE2E2',

                // Dark Truffle Mode
                'dark-bg': '#171311',
                'dark-surface': '#201A17',
                'dark-card': '#29221D',
                'dark-border': '#3D332C',
                'dark-text-main': '#F5ECE1',
                'dark-text-muted': '#A6988D',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
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
