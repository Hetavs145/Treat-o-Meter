import { Gift, AlertTriangle, DollarSign } from 'lucide-react';

export default function TaskActions({ onAction, formMode }) {
    if (formMode) return null; // Hide actions if form is open

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <button
                onClick={() => onAction('reward')}
                className="group relative overflow-hidden rounded-3xl bg-mint dark:bg-green-900/40 p-6 md:p-8 hover:bg-mint/90 dark:hover:bg-green-900/60 transition-all border border-mint/20 dark:border-green-800/30 shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
            >
                {/* Light: Glass Icon | Dark: Solid Icon */}
                <div className="bg-white/40 dark:bg-green-800 p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Gift size={32} className="text-green-800 dark:text-green-100" />
                </div>
                <span className="font-bold text-lg md:text-xl text-green-900 dark:text-green-100 hidden md:block">Add Reward</span>
            </button>

            <button
                onClick={() => onAction('punishment')}
                className="group relative overflow-hidden rounded-3xl bg-rose dark:bg-red-900/40 p-6 md:p-8 hover:bg-rose/90 dark:hover:bg-red-900/60 transition-all border border-rose/20 dark:border-red-800/30 shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
            >
                <div className="bg-white/40 dark:bg-red-800 p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <AlertTriangle size={32} className="text-red-800 dark:text-red-100" />
                </div>
                <span className="font-bold text-lg md:text-xl text-red-900 dark:text-red-100 hidden md:block">Add Punishment</span>
            </button>

            <button
                onClick={() => onAction('split')}
                className="group relative overflow-hidden rounded-3xl bg-orange-100 dark:bg-orange-900/40 p-6 md:p-8 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-all border border-orange-200 dark:border-orange-800/30 shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center gap-2 col-span-2 md:col-span-1"
            >
                <div className="bg-white/40 dark:bg-orange-800 p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <DollarSign size={32} className="text-orange-800 dark:text-orange-100" />
                </div>
                <span className="font-bold text-lg md:text-xl text-orange-900 dark:text-orange-100 hidden md:block">Reward / Punishment</span>
            </button>
        </div>
    );
}
