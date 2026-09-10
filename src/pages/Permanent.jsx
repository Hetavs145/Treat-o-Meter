import React from 'react';

import { useState, useEffect } from 'react';
import PermanentQuadrants from '../components/PermanentQuadrants';
import PermanentTracker from '../components/PermanentTracker';
import {
    saveTransaction,
    getTasks,
    saveTasks,
    getPermanentIds,
    savePermanentIds,
    getPermanentLogs,
    savePermanentLogs,
} from '../utils/storage';
import { AlertTriangle, WifiOff, Loader } from 'lucide-react';

export default function Permanent() {
    const [allTasks, setAllTasks] = useState([]);
    const [permanentIds, setPermanentIds] = useState(() => getPermanentIds());

    // Logs: { "2024-01-09": { "taskId1": "completed" } }
    const [logs, setLogs] = useState(() => getPermanentLogs());

    // --- Task Management (Edit/Delete) ---

    // Update a task (Name, Amount, Desc)
    const handleUpdateTask = (updatedTask) => {
        const newTasks = allTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        setAllTasks(newTasks);
        saveTasks(newTasks);
        // Force trigger storage event for other tabs/components
        window.dispatchEvent(new Event('storage'));
    };

    // Delete a task (Remove from Permanent + Remove from Global Storage)
    const handleDeleteTask = (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task completely?")) return;

        // 1. Remove from allTasks
        const newTasks = allTasks.filter(t => t.id !== taskId);
        setAllTasks(newTasks);
        saveTasks(newTasks);

        // 2. Remove from Permanent IDs
        setPermanentIds(prev => prev.filter(id => id !== taskId));

        // Force event
        window.dispatchEvent(new Event('storage'));
    };

    const [isEditMode, setIsEditMode] = useState(false);

    // Secure Date
    const [secureDate, setSecureDate] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [loadingDate, setLoadingDate] = useState(true);

    // Load tasks from storage
    useEffect(() => {
        const loadTasks = () => {
            setAllTasks(getTasks());
            setPermanentIds(getPermanentIds());
            setLogs(getPermanentLogs());
        };
        loadTasks();
        window.addEventListener('storage', loadTasks); // Listen for updates (incl. cloud sync pulls)
        return () => window.removeEventListener('storage', loadTasks);
    }, []);

    // Fetch Secure Date
    useEffect(() => {
        const fetchDate = async () => {
            try {
                // Try WorldTimeAPI (https — the http endpoint is blocked as mixed content on an https-served app)
                const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
                if (!res.ok) throw new Error('API Failed');
                const data = await res.json();
                // Convert to user's local timezone approximately for date tracking
                // Or just use the browser's local time derived from the trusted offset? 
                // Simplest 'Online' check: just using new Date() BUT only if the fetch succeeds proves internet.
                // Actually user said "auto refresh date with current date(not changed if system date changed i.e cloud/online based)"
                // This means we trust the API time.
                const apiTime = new Date(data.datetime);
                setSecureDate(apiTime);
                setIsOffline(false);
            } catch (e) {
                console.warn("Time API failed, falling back to system time", e);
                setSecureDate(new Date());
                setIsOffline(true);
            } finally {
                setLoadingDate(false);
            }
        };
        fetchDate();
    }, []);

    // Persist Permanent IDs
    useEffect(() => {
        savePermanentIds(permanentIds);
    }, [permanentIds]);

    // Persist Logs
    useEffect(() => {
        savePermanentLogs(logs);
    }, [logs]);

    const handleTogglePermanent = (taskId, type) => {
        setPermanentIds(prev => {
            const isSelected = prev.includes(taskId);
            if (isSelected) {
                return prev.filter(id => id !== taskId);
            } else {
                // Check limit (4 per type logic handled efficiently here?)
                // Actually user said "at max 4 tasks(reward and punishment for each)".
                // We need to count how many of THIS type are already selected.
                const task = allTasks.find(t => t.id === taskId);
                const currentTypeCount = prev.filter(id => {
                    const t = allTasks.find(at => at.id === id);
                    // Match logic: 'reward' or valueType money + rewardValue
                    if (!t) return false;
                    const isRew = t.type === 'reward' || (t.valueType === 'money' && t.rewardValue > 0);
                    const isPun = t.type === 'punishment' || (t.valueType === 'money' && t.punishmentValue > 0);

                    if (type === 'reward') return isRew;
                    return isPun;
                }).length;

                if (currentTypeCount >= 4) {
                    alert(`You can only select up to 4 permanent ${type}s!`);
                    return prev;
                }
                return [...prev, taskId];
            }
        });
    };

    const handleLogUpdate = (dateStr, taskId, type) => {
        // Only allow updating Today (secure logic)? 
        // User said "if confirmed update the balance accordingly else if canceled accrodingly or auto mark not completed after 24hrs"
        // Implicitly means you can only mark 'today'. Past days are locked/auto-failed.

        // Double check date
        if (!secureDate) return;
        const todayStr = secureDate.toISOString().split('T')[0];
        if (dateStr !== todayStr) {
            // Maybe allow checking strictly previous day if within 24h?
            // For simplicity and user request "auto mark not completed after 24hrs", we strict lock past days.
            alert("You can only mark tasks for today!");
            return;
        }

        // Prevent double marking
        if (logs[dateStr]?.[taskId] === 'completed') return;

        // Update Log
        setLogs(prev => ({
            ...prev,
            [dateStr]: {
                ...(prev[dateStr] || {}),
                [taskId]: 'completed'
            }
        }));

        // Update Balance
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
            // Determine amount
            // If it's a reward task -> Credit. If punishment -> Debit (cost).
            // Wait, "Permanent Reward" usually means "I did a good habit, give me money".
            // "Permanent Punishment" usually means "I did a bad habit, take my money".

            let amount = 0;
            let transactionType = 'reward'; // or punishment

            if (type === 'reward') {
                amount = task.valueType === 'money' ? task.rewardValue : 0; // Or standard value?
                transactionType = 'reward';
            } else {
                amount = task.valueType === 'money' ? task.punishmentValue : 0;
                transactionType = 'punishment';
            }

            if (amount > 0) {
                saveTransaction({
                    type: transactionType,
                    amount: amount,
                    description: `Permanent Task: ${task.name}`,
                    date: new Date().toISOString()
                });
                // Force balance refresh? Window event dispatch usually handled by storage util?
                // storage.js dispatches 'balance-updated'. TaskManager listens to it? Home listens? 
                // We might need to dispatch custom event if storage doesn't.
                // Let's assume saveTransaction handles dispatch if we implemented it right. 
                // Checking storage util (mental check): usually yes.
                window.dispatchEvent(new Event('balance-updated'));
            }
        }
    };

    // Filter "Permanent" Task Objects
    const permanentTaskObjects = allTasks.filter(t => permanentIds.includes(t.id));

    if (loadingDate) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <Loader className="animate-spin" /> Synchronizing Time...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 pb-20">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-black text-outline-white mb-2">
                            Permanent Habits
                        </h1>
                        <p className="text-sm opacity-60 flex items-center gap-2">
                            {isOffline ? (
                                <span className="text-red-500 flex items-center gap-1 font-bold"><WifiOff size={14} /> Offline Mode (System Time)</span>
                            ) : (
                                <span className="text-green-600 font-bold">● Online Synced</span>
                            )}
                            <span className="font-bold text-black text-outline-white">{secureDate?.toDateString()}</span>
                        </p>
                    </div>
                </div>

                {/* Quadrants Section */}
                <PermanentQuadrants
                    allTasks={allTasks}
                    permanentIds={permanentIds}
                    onTogglePermanent={handleTogglePermanent}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                />

                {/* Tracker Section (Only visible when not editing?) -> User didn't specify, but better UX to keep visible */}
                {!isEditMode && permanentIds.length > 0 && (
                    <PermanentTracker
                        permanentTasks={permanentTaskObjects}
                        logs={logs}
                        onLogUpdate={handleLogUpdate}
                        secureDate={secureDate}
                    />
                )}
            </div>
        </div>
    );
}
