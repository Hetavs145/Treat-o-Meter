import { Play, Check, X, Clock, AlertTriangle, Plus, DollarSign, Gift, Minus, RefreshCw, Calendar, Download, Edit2, Trash2, BookOpen, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrivacyNote from '../components/PrivacyNote';

export default function Guide() {
    return (
        <div className="min-h-screen pt-24 px-4 pb-20 max-w-5xl mx-auto space-y-12">

            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 animate-scale-in">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-black text-outline-white">
                    User Guide
                </h1>
                <p className="text-gray-600 dark:text-gray-300 font-medium max-w-lg mx-auto">
                    Master your habits with Treat-o-Meter! Here's how to track rewards, avoid punishments, and balance your life.
                </p>
            </div>

            {/* Privacy Note Component */}
            <PrivacyNote />

            {/* Section 1: The Basics (Balance) */}
            <section className="glass-card p-8 animate-slide-up">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-black text-outline-white">The Balance System</h2>
                        <p className="text-gray-500 text-sm font-bold">Credits vs Debits</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2"><Plus size={16} /> Earning (Rewards)</h3>
                        <p className="text-sm text-gray-600">
                            Completing <strong>Reward Tasks</strong> adds money (or points) to your balance. Use this balance to treat yourself!
                        </p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2"><Minus size={16} /> Spending (Punishments)</h3>
                        <p className="text-sm text-gray-600">
                            Failing tasks or completing <strong>Punishment Tasks</strong> deducts from your balance. Keep it positive!
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Creating Tasks */}
            <section className="glass-card p-8 animate-slide-up delay-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-black text-outline-white">Creating Tasks</h2>
                        <p className="text-gray-500 text-sm font-bold">Temporary & Timed</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        From the Home Dashboard, you can create three types of tasks:
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <h4 className="font-bold text-green-800 mb-1">Reward Task 🎁</h4>
                            <p className="text-xs text-green-700">Get paid if you succeed. Nothing happens if you fail.</p>
                        </div>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <h4 className="font-bold text-red-800 mb-1">Punishment Task ⚠️</h4>
                            <p className="text-xs text-red-700">Avoid paying by succeeding. Lose money if you fail.</p>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                            <h4 className="font-bold text-orange-800 mb-1">Split Task ⚡</h4>
                            <p className="text-xs text-orange-700">High stakes! Reward for success, Punishment for failure.</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mt-4">
                        <span className="font-bold"> Tip:</span> You can set a <strong>Timer</strong> (Hours/Mins). If you don't finish in time, it counts as a failure!
                    </div>
                </div>
            </section>

            {/* Section 3: Permanent Habits */}
            <section className="glass-card p-8 animate-slide-up delay-200">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-mint rounded-xl text-green-800">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-black text-outline-white">Permanent Habits</h2>
                        <p className="text-gray-500 text-sm font-bold">Daily Tracking</p>
                    </div>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                        Want to track a daily habit? Go to the <strong>Permanent Page</strong>.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Edit Mode</strong>: Click "Edit Permanent Tasks" to select up to 4 Rewards and 4 Punishments.</li>
                        <li><strong>Migration</strong>: Selecting a task here removes it from your Home list so you can focus on it daily.</li>
                        <li><strong>5-Day Tracker</strong>: Check off tasks daily. The tracker resets every day but keeps your 5-day history.</li>
                        <li><strong>Editing</strong>: Use the <Edit2 size={14} className="inline text-black" /> Pencil icon to change amounts or names. Use <Trash2 size={14} className="inline text-red-500" /> Trash to delete.</li>
                    </ul>
                </div>
            </section>

            {/* Section 4: History & Export */}
            <section className="glass-card p-8 animate-slide-up delay-300">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-gray-100 rounded-xl text-gray-800">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-black text-outline-white">History & PDF</h2>
                        <p className="text-gray-500 text-sm font-bold">Monthly Statements</p>
                    </div>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                        The <strong>History Page</strong> shows every transaction.
                    </p>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white border border-black rounded-lg shadow-sm">
                            <Download size={20} className="text-black" />
                        </div>
                        <div>
                            <h4 className="font-bold text-black">Save as PDF</h4>
                            <p className="text-sm">Download a professional monthly statement. perfect for keeping records!</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="text-center pt-8">
                <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-105 active:scale-95 shadow-xl">
                    <Play size={20} fill="white" /> Gets Started
                </Link>
            </div>

        </div>
    );
}
