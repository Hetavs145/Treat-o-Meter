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
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 glass border-b border-paper-border/80 dark:border-dark-border">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Mobile Hamburger (Left) */}
                <button 
                    className="md:hidden p-2 text-espresso dark:text-dark-text-main hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors" 
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <Menu size={22} />
                </button>

                {/* Logo */}
                <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:flex-shrink-0">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="Treat-o-Meter" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-xl font-bold tracking-tight text-espresso dark:text-dark-text-main hidden md:block">
                            Treat<span className="text-amber-treat font-normal">·o·</span>Meter
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1.5 absolute left-1/2 transform -translate-x-1/2 bg-paper-elevated/70 dark:bg-dark-card/70 p-1.5 rounded-full border border-paper-border/60 dark:border-dark-border">
                    <Link
                        to="/"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isActive('/') 
                                ? 'bg-amber-treat text-white shadow-sm font-semibold' 
                                : 'text-espresso-muted dark:text-dark-text-muted hover:text-espresso dark:hover:text-dark-text-main'
                        }`}
                    >
                        <Home size={15} /> Home
                    </Link>
                    <Link
                        to="/history"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isActive('/history') 
                                ? 'bg-amber-treat text-white shadow-sm font-semibold' 
                                : 'text-espresso-muted dark:text-dark-text-muted hover:text-espresso dark:hover:text-dark-text-main'
                        }`}
                    >
                        <History size={15} /> History
                    </Link>
                    <Link
                        to="/permanent"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isActive('/permanent') 
                                ? 'bg-amber-treat text-white shadow-sm font-semibold' 
                                : 'text-espresso-muted dark:text-dark-text-muted hover:text-espresso dark:hover:text-dark-text-main'
                        }`}
                    >
                        <span className="text-base leading-none">∞</span> Permanent
                    </Link>
                    <Link
                        to="/guide"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isActive('/guide') 
                                ? 'bg-amber-treat text-white shadow-sm font-semibold' 
                                : 'text-espresso-muted dark:text-dark-text-muted hover:text-espresso dark:hover:text-dark-text-main'
                        }`}
                    >
                        <BookOpen size={15} /> Guide
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2.5 text-espresso-muted dark:text-dark-text-muted hover:text-espresso dark:hover:text-dark-text-main hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className="relative" ref={profileRef}>
                        <button 
                            className="flex items-center gap-2 p-1 rounded-full border border-paper-border dark:border-dark-border hover:opacity-90 transition-opacity" 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-amber-soft text-amber-treat rounded-full flex items-center justify-center font-bold text-xs">
                                    <User size={15} />
                                </div>
                            )}
                        </button>
                        {/* Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-paper-border dark:border-dark-border py-1.5 animate-fade-in z-50">
                                <div className="px-4 py-2.5 border-b border-paper-border/60 dark:border-dark-border/60">
                                    <p className="text-xs text-espresso-muted dark:text-dark-text-muted">Signed in as</p>
                                    <p className="text-sm font-semibold truncate text-espresso dark:text-dark-text-main">{user?.displayName || user?.email || 'Guest User'}</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-crimson-lapse hover:bg-crimson-soft/40 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Profile Icon */}
                <div className="md:hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-paper-border" />
                    ) : (
                        <div className="w-8 h-8 bg-amber-soft text-amber-treat rounded-full flex items-center justify-center">
                            <User size={16} />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-b border-paper-border dark:border-dark-border p-4 flex flex-col gap-2 shadow-2xl">
                    <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${
                            isActive('/') 
                                ? 'bg-amber-treat text-white font-semibold' 
                                : 'text-espresso dark:text-dark-text-main hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        <Home size={18} /> Home
                    </Link>
                    <Link
                        to="/history"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${
                            isActive('/history') 
                                ? 'bg-amber-treat text-white font-semibold' 
                                : 'text-espresso dark:text-dark-text-main hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        <History size={18} /> History
                    </Link>
                    <Link
                        to="/permanent"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${
                            isActive('/permanent') 
                                ? 'bg-amber-treat text-white font-semibold' 
                                : 'text-espresso dark:text-dark-text-main hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        <span className="text-lg leading-none">∞</span> Permanent
                    </Link>
                    <Link
                        to="/guide"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium ${
                            isActive('/guide') 
                                ? 'bg-amber-treat text-white font-semibold' 
                                : 'text-espresso dark:text-dark-text-main hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        <BookOpen size={18} /> Guide
                    </Link>
                    <div className="h-px bg-paper-border dark:bg-dark-border my-1"></div>
                    <button 
                        onClick={toggleTheme} 
                        className="flex items-center gap-3 p-3 text-espresso dark:text-dark-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-sm font-medium"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full text-left p-3 text-crimson-lapse hover:bg-crimson-soft/40 flex items-center gap-3 rounded-xl text-sm font-medium transition-colors"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            )}
        </nav>
    );
}
