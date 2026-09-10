import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { setCloudSyncUser, pullCloudData } from '../utils/cloudSync';
import Background from './Background';

export default function AuthWrapper({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                setSyncing(true);
                setCloudSyncUser(currentUser.uid);
                try {
                    const changed = await pullCloudData(currentUser.uid);
                    if (changed) {
                        // Local data was replaced by the cloud snapshot — let pages re-read it.
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('balance-updated'));
                    }
                } catch (err) {
                    console.error('Failed to sync with cloud, continuing with local data:', err);
                } finally {
                    setSyncing(false);
                }
            } else {
                setCloudSyncUser(null);
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || syncing) return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream overflow-hidden">
            <div className="relative">
                {/* Bouncing Logo */}
                <img src="/logo.png" alt="Loading" className="w-24 h-24 mb-4 animate-bounce" />
                {/* Shadow */}
                <div className="w-16 h-4 bg-black/10 rounded-full blur-sm mx-auto animate-pulse"></div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                <h2 className="text-3xl font-black text-black text-outline-white tracking-widest uppercase animate-pulse">
                    Treat-o-Meter
                </h2>
                <p className="text-gray-500 font-bold text-sm tracking-widest animate-pulse">
                    {syncing ? 'SYNCING YOUR DATA...' : 'LOADING...'}
                </p>
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden">
                <Background />
                <div className="glass-card flex flex-col items-center text-center max-w-md w-full relative z-10">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Treat-o-Meter 🍦</h1>
                    <p className="text-gray-500 dark:text-white mb-8">Manage your balance with a sprinkle of fun!</p>
                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                        <span className="font-medium text-gray-700">Sign in with Google</span>
                    </button>
                </div>
            </div>
        );
    }

    return children;
}
