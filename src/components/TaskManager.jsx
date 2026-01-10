import { useState, useEffect } from 'react';
import { Play, Check, X, Clock, AlertTriangle, Plus, DollarSign, Gift, Minus } from 'lucide-react';
import { saveTransaction } from '../utils/storage';

export default function TaskManager({ onUpdateBalance, formMode, setFormMode }) {
    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('sweet_treat_tasks');
        return stored ? JSON.parse(stored) : [];
    });

    const [permanentIds, setPermanentIds] = useState(() => {
        const stored = localStorage.getItem('sweet_treat_permanent_ids');
        return stored ? JSON.parse(stored) : [];
    });

    // Listen for storage updates to keep permanent IDs in sync (if changed in Permanent tab)
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem('sweet_treat_permanent_ids');
            if (stored) setPermanentIds(JSON.parse(stored));
        };
        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom event if we add one, but storage event works for cross-tab or strict updates
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Filter out permanent tasks from the display list
    const visibleTasks = tasks.filter(t => !permanentIds.includes(t.id));

    // Form Mode state is now lifted to parent

    const [newTask, setNewTask] = useState({
        name: '',
        durationHours: 0,
        durationMinutes: 0,
        valueType: 'money', // 'money' | 'other'
        rewardValue: 100,
        punishmentValue: 50,
        rewardDescription: '',
        punishmentDescription: '',
        overtime: 5, // minutes
    });

    // Persist tasks
    useEffect(() => {
        localStorage.setItem('sweet_treat_tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Timer Tick
    useEffect(() => {
        const interval = setInterval(() => {
            setTasks(prev => prev.map(t => ({ ...t, now: Date.now() })));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const resetForm = () => {
        setFormMode(null);
        setNewTask({
            name: '',
            durationHours: 0,
            durationMinutes: 0,
            valueType: 'money',
            rewardValue: 100,
            punishmentValue: 50,
            rewardDescription: '',
            punishmentDescription: '',
            overtime: 5,
        });
    };

    const addTask = () => {
        if (!newTask.name.trim()) return;

        // Validation: Minutes compulsory if Hours > 0 is not strictly enforced by logic typically, 
        // usually if Hours > 0, we just calculate total. 
        // But per requirement: "if hours added then minutes compulsory".
        // We'll treat 0 as a valid minutes input if user explicitly typed it, but for simplicity, 
        // let's just ensure total duration > 0 if it's a timed task.
        // Actually, requirement is: "hrs, minutes, optional(but if hours added then minutes compulsory)".
        // Implication: Can have 0 hr 0 min? Maybe not.

        const totalMinutes = Number(newTask.durationHours) * 60 + Number(newTask.durationMinutes);

        const now = Date.now();
        const startTime = now + 10000; // Starts in 10s
        const durationMs = totalMinutes * 60 * 1000;
        const deadline = durationMs > 0 ? startTime + durationMs : null;

        const task = {
            id: now.toString(),
            name: newTask.name,
            type: formMode, // 'reward', 'punishment', 'split'
            valueType: newTask.valueType,
            rewardValue: newTask.rewardValue,
            punishmentValue: newTask.punishmentValue,
            rewardDescription: newTask.rewardDescription,
            punishmentDescription: newTask.punishmentDescription,
            durationMs,
            startTime,
            deadline,
            overtime: newTask.overtime, // Only relevant if deadline exists
            status: 'pending',
            now: now
        };

        setTasks([...tasks, task]);
        resetForm();
    };

    const completeTask = (task) => {
        const now = Date.now();
        if (now < task.startTime) {
            alert("Wait for the 10s countdown!");
            return;
        }
        // Overtime check: only if deadline exists
        const overtimeLimitMs = Number(task.overtime || 0) * 60 * 1000;
        const maxTime = task.deadline ? task.deadline + overtimeLimitMs : Infinity;

        let result = '';
        let amount = 0;
        let transType = '';
        let description = '';

        if (now <= maxTime) {
            // Success
            if (task.type === 'reward' || task.type === 'split') {
                result = 'completed - rewarded';
                transType = 'reward';
                if (task.valueType === 'money') {
                    amount = Number(task.rewardValue);
                    description = `Task: ${task.name} (Success) +${amount}`;
                } else {
                    description = `Task: ${task.name} (Success) - Reward: ${task.rewardDescription}`;
                    amount = 0; // Just logging
                }
            } else {
                // Punishment task SUCCESS -> No punishment, nothing happens.
                result = 'completed - avoided punishment';
                description = `Task: ${task.name} (Success) - No Punishment`;
            }
        } else {
            // Failed / Too late
            if (task.type === 'punishment' || task.type === 'split') {
                result = 'failed - punished';
                transType = 'punishment';
                if (task.valueType === 'money') {
                    amount = Number(task.punishmentValue);
                    description = `Task: ${task.name} (Failed) -${amount}`;
                } else {
                    description = `Task: ${task.name} (Failed) - Punishment: ${task.punishmentDescription}`;
                    amount = 0;
                }
            } else {
                // Reward task FAILED -> No reward.
                result = 'failed - no reward';
                description = `Task: ${task.name} (Failed) - No Reward`;
            }
        }

        saveTransaction({
            type: transType || 'none', // 'none' for failed reward
            amount,
            description,
            isDiscarded: false,
            // New Timestamps
            startTime: task.startTime,
            endTime: now
        });
        if (amount > 0 && transType) {
            onUpdateBalance();
        }

        // Remove task
        setTasks(tasks.filter(t => t.id !== task.id));
    };

    const cancelTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const hasDuration = (Number(newTask.durationHours) > 0 || Number(newTask.durationMinutes) > 0);

    return (
        <div className="glass-card mt-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="text-black bg-white rounded-full dark:text-gray-300 dark:bg-transparent" />
                    <h2 className="text-xl font-bold text-black text-outline-white">Tasks</h2>
                </div>
            </div>

            {formMode && (
                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl mb-6 space-y-4 border border-gray-100 dark:border-white/10 animate-fade-in relative transition-colors">
                    <button onClick={resetForm} className="absolute top-4 right-4 text-black hover:text-black/70 dark:text-gray-500 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                    <h3 className="text-lg font-bold capitalize text-black mb-4">{formMode === 'split' ? 'Reward & Punishment' : formMode} Task</h3>

                    {/* Name */}
                    <div>
                        <label className="text-xs font-bold text-black uppercase">Task Name *</label>
                        <input
                            placeholder="e.g. Finish Project"
                            className="w-full p-2 mt-1 rounded-lg border border-gray-200 bg-white text-black focus:outline-none focus:border-blue-400 transition-colors"
                            value={newTask.name}
                            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Duration (Optional)</label>
                        <div className="flex gap-2 mt-1">
                            <div className="w-1/2">
                                <input
                                    type="number"
                                    placeholder="Hrs"
                                    className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                                    min="0"
                                    value={newTask.durationHours || ''}
                                    onChange={e => setNewTask({ ...newTask, durationHours: e.target.value })}
                                />
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">Hours</span>
                            </div>
                            <div className="w-1/2">
                                <input
                                    type="number"
                                    placeholder="Mins"
                                    className={`w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-colors ${Number(newTask.durationHours) > 0 && !newTask.durationMinutes ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 bg-white'}`}
                                    min="0"
                                    value={newTask.durationMinutes || ''}
                                    onChange={e => setNewTask({ ...newTask, durationMinutes: e.target.value })}
                                />
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">Minutes {(Number(newTask.durationHours) > 0) && '*'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Overtime - Only if Duration > 0 */}
                    {hasDuration && (
                        <div className="animate-fade-in">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Overtime Allowance</label>
                            <select
                                className="w-full p-2 mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                                value={newTask.overtime}
                                onChange={e => setNewTask({ ...newTask, overtime: e.target.value })}
                            >
                                <option value="0">Strict Deadline (0m)</option>
                                <option value="5">5 Minutes</option>
                                <option value="10">10 Minutes</option>
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                            </select>
                        </div>
                    )}

                    {/* Value Type */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Value Type</label>
                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={() => setNewTask({ ...newTask, valueType: 'money' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border ${newTask.valueType === 'money' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                            >
                                Money
                            </button>
                            <button
                                onClick={() => setNewTask({ ...newTask, valueType: 'other' })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border ${newTask.valueType === 'other' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-500'}`}
                            >
                                Other
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Inputs based on Mode and Type */}
                    <div className="space-y-3">
                        {/* Reward Input */}
                        {(formMode === 'reward' || formMode === 'split') && (
                            <div>
                                <label className="text-xs font-bold text-green-600 uppercase">Reward {newTask.valueType === 'money' ? 'Amount' : 'Description'}</label>
                                {newTask.valueType === 'money' ? (
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">₹</span>
                                        <input
                                            type="number"
                                            className="w-full p-2 pl-8 rounded-lg border border-green-200 bg-green-50 text-gray-900 focus:border-green-500 focus:outline-none transition-colors"
                                            value={newTask.rewardValue}
                                            onChange={e => setNewTask({ ...newTask, rewardValue: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="e.g. Watch a Movie"
                                        className="w-full p-2 mt-1 rounded-lg border border-green-200 bg-green-50 text-gray-900 focus:border-green-500 focus:outline-none transition-colors"
                                        value={newTask.rewardDescription}
                                        onChange={e => setNewTask({ ...newTask, rewardDescription: e.target.value })}
                                    />
                                )}
                            </div>
                        )}

                        {/* Punishment Input */}
                        {(formMode === 'punishment' || formMode === 'split') && (
                            <div>
                                <label className="text-xs font-bold text-red-600 uppercase">Punishment {newTask.valueType === 'money' ? 'Amount' : 'Description'}</label>
                                {newTask.valueType === 'money' ? (
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            className="w-full p-2 pl-8 rounded-lg border border-red-200 bg-red-50 text-gray-900 focus:border-red-500 focus:outline-none transition-colors"
                                            value={newTask.punishmentValue}
                                            onChange={e => setNewTask({ ...newTask, punishmentValue: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="e.g. 50 Pushups"
                                        className="w-full p-2 mt-1 rounded-lg border border-red-200 bg-red-50 text-gray-900 focus:border-red-500 focus:outline-none transition-colors"
                                        value={newTask.punishmentDescription}
                                        onChange={e => setNewTask({ ...newTask, punishmentDescription: e.target.value })}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={addTask}
                        className={`w-full py-3 rounded-xl font-bold text-black shadow-md transition-transform active:scale-95 ${formMode === 'reward' ? 'bg-green-500 hover:bg-green-600' :
                            formMode === 'punishment' ? 'bg-red-500 hover:bg-red-600' :
                                'bg-gradient-to-r from-green-500 to-red-500 hover:from-green-600 hover:to-red-600'
                            }`}
                    >
                        Start {formMode === 'split' ? 'Challenge' : 'Task'}
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {visibleTasks.length === 0 && !formMode && <p className="text-gray-400 text-center italic py-8">No active tasks. Start one above!</p>}
                {visibleTasks.map(task => {
                    const now = Date.now();
                    const isStarted = now >= task.startTime;

                    let timeLeftStr = "--:--";
                    let isOvertime = false;
                    let isExpired = false;

                    if (task.deadline) {
                        const timeLeft = task.deadline - now;
                        isOvertime = timeLeft < 0;
                        const overtimeLimitMs = Number(task.overtime || 0) * 60 * 1000;
                        isExpired = now > (task.deadline + overtimeLimitMs);
                        if (!isExpired) {
                            timeLeftStr = new Date(Math.abs(timeLeft)).toISOString().substr(11, 8);
                        }
                    } else {
                        // For tasks with no duration (just a checklist item basically), checking it off is always valid
                        timeLeftStr = "Active";
                    }

                    return (
                        <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group transition-colors">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-800">{task.name}</p>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${task.type === 'reward' ? 'bg-green-100 text-green-700' :
                                        task.type === 'punishment' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {task.type === 'split' ? 'R/P' : task.type}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {task.type !== 'punishment' && (
                                        <span className="text-green-600 mr-3">
                                            🎁 {task.valueType === 'money' ? `₹${task.rewardValue}` : task.rewardDescription}
                                        </span>
                                    )}
                                    {task.type !== 'reward' && (
                                        <span className="text-red-600">
                                            ⚠️ {task.valueType === 'money' ? `₹${task.punishmentValue}` : task.punishmentDescription}
                                        </span>
                                    )}
                                </div>

                                {task.deadline && (
                                    <div className="text-xs text-gray-500 mt-1 font-mono">
                                        {!isStarted ? (
                                            <span className="text-blue-500 font-bold">Starts in {Math.ceil((task.startTime - now) / 1000)}s</span>
                                        ) : isExpired ? (
                                            <span className="text-red-500 font-bold">Expired</span>
                                        ) : (
                                            <span className={`${isOvertime ? 'text-orange-500' : 'text-gray-500'} font-bold`}>
                                                {isOvertime ? 'OVERTIME: ' : 'Time Left: '}
                                                {timeLeftStr}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => completeTask(task)} disabled={!isStarted} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 disabled:opacity-50 transition-colors">
                                    <Check size={18} />
                                </button>
                                <button onClick={() => cancelTask(task.id)} className="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
