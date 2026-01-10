import React from 'react';
import { Lock } from 'lucide-react';

export default function PrivacyNote() {
    return (
        <div className="glass-card p-6 border-l-4 border-black animate-slide-up flex gap-4 items-start bg-white/50 mb-8 mx-auto max-w-3xl">
            <div className="p-3 bg-gray-100 rounded-full text-black shrink-0">
                <Lock size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-black text-outline-white mb-1">Privacy First 🔒</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    <strong>Your data stays with you.</strong> All your tasks, balances, and history are stored <strong>locally on your device</strong> (in your browser).
                    We only use Google/Firebase for secure login. We do not track your habits or sell your data.
                </p>
            </div>
        </div>
    );
}
