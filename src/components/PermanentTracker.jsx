import { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, RefreshCw } from 'lucide-react';

export default function PermanentTracker({ permanentTasks, logs, onLogUpdate, secureDate }) {
    // Generate last 5 days based on secureDate
    const [dates, setDates] = useState([]);

    useEffect(() => {
        if (!secureDate) return;
        const d = new Date(secureDate);
        const last5 = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(d);
            date.setDate(d.getDate() - i); // Today, Yesterday, ...
            last5.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
        }
        setDates(last5);
    }, [secureDate]);

    // Separate tasks by type
    const rewards = permanentTasks.filter(t => t.type === 'reward' || t.type === 'split');
    const punishments = permanentTasks.filter(t => t.type === 'punishment' || t.type === 'split');

    // Helper to check status
    const getStatus = (dateStr, taskId) => {
        return logs[dateStr]?.[taskId] || 'pending'; // 'pending', 'completed', 'failed' (auto-fail after 24h?)
        // User logic: "auto mark not completed after 24hrs".
        // If dateStr is not today, and status is pending -> it's essentially 'failed' or 'expired'.
    };

    const isToday = (dateStr) => {
        if (!secureDate) return false;
        return dateStr === new Date(secureDate).toISOString().split('T')[0];
    };

    return (
        <div className="glass-card p-6 w-full overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black text-outline-white">5-Day Tracker</h3>
                <div className="text-xs text-black text-outline-white font-bold flex items-center gap-1">
                    <RefreshCw size={12} /> Auto-refreshes daily
                </div>
            </div>

            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-black/10 dark:border-white/10">
                        <th className="py-3 px-2 font-bold min-w-[150px] text-black text-outline-white">Task</th>
                        {dates.map((date, i) => (
                            <th key={date} className="py-3 px-2 text-center font-medium">
                                <span className={`block text-xs uppercase font-black text-black text-outline-white`}>
                                    {i === 0 ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-xs font-bold text-black text-outline-white">{new Date(date).getDate()}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Rewards Section */}
                    {rewards.length > 0 && <tr className="bg-mint/10"><td colSpan={6} className="py-2 px-2 text-xs font-bold text-green-800 uppercase tracking-widest text-outline-white">Rewards (Credit)</td></tr>}
                    {rewards.map(task => (
                        <tr key={task.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-white/30 transition-colors">
                            <td className="py-3 px-2 font-bold text-black text-outline-white">{task.name}</td>
                            {dates.map(date => {
                                const status = getStatus(date, task.id);
                                const isCurrentDay = isToday(date);
                                const isPast = !isCurrentDay;

                                return (
                                    <td key={date} className="py-3 px-2 text-center">
                                        <TrackerCell
                                            status={status}
                                            type="reward"
                                            isPast={isPast}
                                            onToggle={() => onLogUpdate(date, task.id, type = "reward")}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}

                    {/* Punishments Section */}
                    {punishments.length > 0 && <tr className="bg-rose/10"><td colSpan={6} className="py-2 px-2 text-xs font-bold text-red-800 uppercase tracking-widest text-outline-white">Punishments (Debit)</td></tr>}
                    {punishments.map(task => (
                        <tr key={task.id} className="border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-white/30 transition-colors">
                            <td className="py-3 px-2 font-bold text-black text-outline-white">{task.name}</td>
                            {dates.map(date => {
                                const status = getStatus(date, task.id);
                                const isCurrentDay = isToday(date);
                                const isPast = !isCurrentDay;

                                return (
                                    <td key={date} className="py-3 px-2 text-center">
                                        <TrackerCell
                                            status={status}
                                            type="punishment"
                                            isPast={isPast}
                                            onToggle={() => onLogUpdate(date, task.id, type = "punishment")}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}

                    {rewards.length === 0 && punishments.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center opacity-50 text-black text-outline-white font-bold">No permanent tasks selected. Use "Edit" above!</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function TrackerCell({ status, type, isPast, onToggle }) {
    // Status: 'pending', 'completed', 'failed' (auto-fail for past pending)

    // Auto-fail logic visual only: if pending and past, show X or dash
    let resolvedStatus = status;
    if (status === 'pending' && isPast) resolvedStatus = 'expired';

    if (resolvedStatus === 'completed') {
        return (
            <button disabled={true} className={`p-1 rounded-full ${type === 'reward' ? 'bg-green-100/80' : 'bg-red-100/80'} border border-black/20 cursor-default shadow-sm`}>
                <Check size={16} strokeWidth={4} className="text-black" />
            </button>
        );
    }

    if (resolvedStatus === 'expired') {
        return <span className="text-black text-outline-white font-bold">-</span>;
    }

    // Pending and Today -> Clickable
    return (
        <button
            onClick={onToggle}
            className="w-6 h-6 rounded-md border-2 border-black bg-white hover:bg-gray-50 transition-all shadow-sm"
        ></button>
    );
}
