import { useTheme } from '../context/ThemeContext';

export default function Background() {
    const { isDarkMode } = useTheme();

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {/* Soft Gradient Overlay - Darker in Dark Mode */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${isDarkMode ? 'from-[#2D1E1A] via-[#3E2723] to-[#2D1E1A] opacity-95' : 'bg-[#E6D0B3] opacity-100'}`}></div>



            {/* Bottom Liquid Chocolate Wave */}
            <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 z-0 animate-wave-flow">
                <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill={isDarkMode ? "#E6D0B3" : "#5D4037"} fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Animated Candies */}
            <div className="absolute top-10 left-10 text-4xl animate-float-slow opacity-20">🍬</div>
            <div className="absolute top-1/4 right-20 text-5xl animate-float-medium opacity-20">🍭</div>
            <div className="absolute bottom-20 left-1/3 text-6xl animate-float-fast opacity-15">🍫</div>
            <div className="absolute top-1/2 left-20 text-3xl animate-spin-slow opacity-20">🍩</div>
            <div className="absolute bottom-1/4 right-10 text-5xl animate-bounce-slow opacity-20">🧁</div>
            <div className="absolute top-20 right-1/3 text-4xl animate-pulse-slow opacity-20">🍪</div>
        </div>
    );
}
