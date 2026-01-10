import { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Menu, User, Moon, Sun, LogOut, Home, History, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const user = auth.currentUser;
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const profileRef = useRef(null);

    const handleSignOut = () => signOut(auth);

    const isActive = (path) => location.pathname === path;

    // Close profile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 glass">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Mobile Hamburger (Left) */}
                <button className="md:hidden p-2 bg-black text-white border border-white rounded-md" onClick={() => setIsOpen(!isOpen)}>
                    <Menu size={24} />
                </button>

                {/* Logo (Center on Mobile, Left on Desktop) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Treat-o-Meter" className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-black tracking-tighter text-black text-outline-white hidden md:block">
                            Treat-o-Meter
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation (Center) */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    <Link
                        to="/"
                        className={`flex items-center gap-2 transition-all pb-1 ${isActive('/') ? 'text-pink-600 text-outline-white border-b-2 border-pink-600 font-black' : 'text-black text-outline-white border-b-2 border-transparent hover:border-black/20 font-extrabold dark:hover:text-pink-300'}`}
                    >
                        <Home size={18} className={isActive('/') ? "text-pink-600 icon-outline-white" : "icon-outline-white"} /> Home
                    </Link>
                    <Link
                        to="/history"
                        className={`flex items-center gap-2 transition-all pb-1 ${isActive('/history') ? 'text-pink-600 text-outline-white border-b-2 border-pink-600 font-black' : 'text-black text-outline-white border-b-2 border-transparent hover:border-black/20 font-extrabold dark:hover:text-pink-300'}`}
                    >
                        <History size={18} className={isActive('/history') ? "text-pink-600 icon-outline-white" : "icon-outline-white"} /> History
                    </Link>
                    <Link
                        to="/permanent"
                        className={`flex items-center gap-2 transition-all pb-1 ${isActive('/permanent') ? 'text-pink-600 text-outline-white border-b-2 border-pink-600 font-black' : 'text-black text-outline-white border-b-2 border-transparent hover:border-black/20 font-extrabold dark:hover:text-pink-300'}`}
                    >
                        <span className={`text-xl font-black text-outline-white ${isActive('/permanent') ? "text-pink-600" : ""}`}>∞</span> Permanent
                    </Link>
                    <Link
                        to="/guide"
                        className={`flex items-center gap-2 transition-all pb-1 ${isActive('/guide') ? 'text-pink-600 text-outline-white border-b-2 border-pink-600 font-black' : 'text-black text-outline-white border-b-2 border-transparent hover:border-black/20 font-extrabold dark:hover:text-pink-300'}`}
                    >
                        <BookOpen size={18} className={isActive('/guide') ? "text-pink-600 icon-outline-white" : "icon-outline-white"} /> Guide
                    </Link>
                </div>

                {/* Desktop Actions (Right) */}
                <div className="hidden md:flex items-center gap-6">
                    <button onClick={toggleTheme} className="p-2 border border-black hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors">
                        {isDarkMode ? <Sun size={20} className="text-black" /> : <Moon size={20} className="text-black" />}
                    </button>

                    <div className="relative" ref={profileRef}>
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-full border border-black" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white dark:border-white/20 shadow-sm" />
                            ) : (
                                <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    <User size={16} className="text-black" />
                                </div>
                            )}
                        </button>
                        {/* Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 py-1 animate-fade-in">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs text-black text-outline-white font-bold">Signed in as</p>
                                    <p className="text-sm font-bold truncate text-black">{user?.displayName || 'User'}</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Profile Icon (Right) - If needed, or just keep it hamburger based */}
                {/* For now, keeping consistent with requirement: "profile icon on top and in centre(horizontally)(the navbar)" ? 
            Requirements said: "hamburger menu onclick on hamburgarprofile icon on top and in centre... then on navbar on right most side"
            This is slightly confusing. "hamburger menu onclick on hamburger profile icon on top and in centre... then on navbar on right most side"
            
            Interpretation: 
            Mobile: 
            - Center: Profile Icon? Or Logo?
            - Left: Hamburger?
            - Right: ?
            
            Let's stick to standard: 
            Mobile: Hamburger (Left), Logo (Center), Profile (Right) is standard.
            But user said "hamburger menu onlclick on hamburgarprofile icon on top and in centre... then on navbar on right most side"
            
            Maybe: Hamburger is the profile icon?
            "keep hamburger menu onlclick on hamburgarprofile icon on top and in centre(horizontally)" 
            
            I'll implement:
            Desktop: Logo Left, Actions Right.
            Mobile: Hamburger Left, Logo Center, Profile Right.
        */}
                <div className="md:hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    ) : (
                        <User size={24} className="text-gray-600" />
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 p-4 flex flex-col gap-4 shadow-xl">
                    <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg ${isActive('/') ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Home size={20} /> Home
                    </Link>
                    <Link
                        to="/history"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg ${isActive('/history') ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <History size={20} /> History
                    </Link>
                    <Link
                        to="/permanent"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg ${isActive('/permanent') ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="text-xl font-black">∞</span> Permanent
                    </Link>
                    <Link
                        to="/guide"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg ${isActive('/guide') ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <BookOpen size={20} /> Guide
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button onClick={toggleTheme} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left p-2 text-red-500 hover:bg-red-50 flex items-center gap-3 rounded-lg"
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            )}
        </nav>
    );
}
