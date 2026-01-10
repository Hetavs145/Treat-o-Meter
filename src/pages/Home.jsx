import { useState, useEffect } from 'react';
import { Plus, Minus, Settings, Save } from 'lucide-react';
import { getBalance, saveTransaction, getSettings, saveSettings as persistSettings, getNetBalance } from '../utils/storage';
import TaskManager from '../components/TaskManager';

import TaskActions from '../components/TaskActions';

export default function Home() {
    const [balance, setBalance] = useState(0);
    const [netBalance, setNetBalance] = useState(0);
    const [showModal, setShowModal] = useState(null); // 'reward' | 'punishment' | 'settings' | null
    const [showResetModal, setShowResetModal] = useState(false);
    const [settings, setSettings] = useState({ currency: '₹', customCurrency: '' });

    // Task Manager Form Mode State (Lifted)
    const [taskFormMode, setTaskFormMode] = useState(null);

    // Modal Inputs
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const refreshBalance = () => {
        setBalance(getBalance());
        setNetBalance(getNetBalance());
        setSettings(getSettings());
    };

    useEffect(() => {
        refreshBalance();
    }, []);

    const handleTransaction = () => {
        if (!amount) return;

        let finalAmount = Number(amount);
        let type = showModal;
        let finalDesc = description;

        if (showModal === 'decrease') {
            // Treat decrease as a punishment type transaction effectively, or just a negative adjustment
            // We'll map it to 'punishment' type for storage consistency or 'adjustment'
            type = 'punishment'; // Using punishment type to subtract
            if (!finalDesc) finalDesc = 'Manual Decrease';
        } else if (showModal === 'reward') {
            if (!finalDesc) finalDesc = 'Manual Reward';
        } else if (showModal === 'punishment') {
            if (!finalDesc) finalDesc = 'Manual Punishment';
        }

        saveTransaction({
            type: type,
            amount: finalAmount,
            description: finalDesc,
            isDiscarded: false
        });
        refreshBalance();
        setShowModal(null);
        setAmount('');
        setDescription('');
    };

    const handleSaveSettings = async () => {
        const oldCurrency = getSettings().currency;
        const newCurrency = settings.currency;

        if (oldCurrency !== newCurrency && (oldCurrency === '₹' || oldCurrency === '$') && (newCurrency === '₹' || newCurrency === '$')) {
            // Currency Switch Detected - Fetch Rates
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await res.json();
                const rate = data.rates.INR; // 1 USD = rate INR

                const currentBalance = getBalance();
                let newBalance = currentBalance;

                if (oldCurrency === '₹' && newCurrency === '$') {
                    // INR -> USD
                    newBalance = currentBalance / rate;
                } else if (oldCurrency === '$' && newCurrency === '₹') {
                    // USD -> INR
                    newBalance = currentBalance * rate;
                }

                const adjustment = newBalance - currentBalance;

                if (adjustment !== 0) {
                    saveTransaction({
                        // We need to add a transaction that results in the correct net change.
                        // If adjustment is positive, we need a 'reward'. If negative, a 'punishment'.
                        // However, to keep it clean, we might want to just set the balance, but our storage is transaction based.
                        // So we add a transaction.
                        type: adjustment > 0 ? 'reward' : 'punishment',
                        amount: Math.abs(adjustment),
                        description: `Currency Conversion Adjustment (${oldCurrency} -> ${newCurrency})`,
                        isDiscarded: false
                    });
                }

            } catch (error) {
                console.error("Failed to fetch exchange rates", error);
                alert("Failed to fetch live exchange rates. Balance not converted.");
            }
        }

        persistSettings(settings);
        refreshBalance();
        setShowModal(null);
    };

    const handleResetBalance = () => {
        if (balance === 0) return;
        setShowResetModal(true);
    };

    const confirmReset = () => {
        const currentBalance = getBalance();
        if (currentBalance === 0) return;

        const type = currentBalance > 0 ? 'punishment' : 'reward';
        saveTransaction({
            type: type,
            amount: Math.abs(currentBalance),
            description: 'Balance Reset',
            isDiscarded: false
        });
        refreshBalance();
        setShowResetModal(false);
    };

    const currencyDisplay = settings.currency === 'custom' ? settings.customCurrency : settings.currency;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 animate-fade-in relative z-0">

            {/* Header Actions */}
            <div className="flex justify-end">
                <button onClick={() => setShowModal('settings')} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
                    <Settings className="text-gray-600" />
                </button>
            </div>

            {/* Balance Display */}
            <div className="glass-card flex flex-col items-center justify-center py-10 px-4 shadow-xl border-t-4 border-white dark:border-white/20 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint to-rose opacity-50"></div>

                {/* Balance Controls */}
                <span className="text-black text-outline-white font-extrabold mb-2 tracking-widest uppercase text-xs">Current Balance</span>
                <div className="text-7xl md:text-9xl font-bold font-sans text-black text-outline-white tracking-tighter drop-shadow-sm flex items-baseline">
                    <span className="text-3xl md:text-5xl text-black text-outline-white font-light mr-2 self-start mt-4">{currencyDisplay}</span>
                    {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>

                {/* Balance Controls - Fixed at Bottom */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => setShowModal('decrease')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 font-bold rounded-lg text-xs hover:bg-red-200 transition-colors border border-black"
                    >
                        <Minus size={14} /> Decrease
                    </button>
                    <button
                        onClick={handleResetBalance}
                        disabled={balance === 0}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-black ${balance === 0 ? 'bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' : 'bg-gray-50 text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    >
                        Reset Balance
                    </button>
                </div>
            </div>

            {/* Task Actions Component */}
            <TaskActions onAction={setTaskFormMode} formMode={taskFormMode} />

            {/* Task Manager Component */}
            <TaskManager
                onUpdateBalance={refreshBalance}
                formMode={taskFormMode}
                setFormMode={setTaskFormMode}
            />

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-up border border-gray-100">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Balance?</h3>
                                <p className="text-gray-500 text-sm">
                                    Are you sure you want to reset your balance to 0?
                                    <br />
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 py-3 rounded-xl text-gray-600 bg-gray-100 font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReset}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-up">

                        {showModal === 'settings' ? (
                            <>
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Settings size={24} /> Settings</h2>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-500 mb-1">Currency Symbol</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSettings({ ...settings, currency: '₹' })} className={`flex-1 py-2 rounded-lg border ${settings.currency === '₹' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200'}`}>₹ (Rupees)</button>
                                            <button onClick={() => setSettings({ ...settings, currency: '$' })} className={`flex-1 py-2 rounded-lg border ${settings.currency === '$' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200'}`}>$ (Dollar)</button>
                                            <button onClick={() => setSettings({ ...settings, currency: 'custom' })} className={`flex-1 py-2 rounded-lg border ${settings.currency === 'custom' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200'}`}>Custom</button>
                                        </div>
                                    </div>
                                    {settings.currency === 'custom' && (
                                        <input
                                            placeholder="Enter Symbol (e.g. pts)"
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 ring-lavender"
                                            value={settings.customCurrency}
                                            onChange={e => setSettings({ ...settings, customCurrency: e.target.value })}
                                        />
                                    )}
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setShowModal(null)} className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-100">Cancel</button>
                                    <button onClick={handleSaveSettings} className="px-6 py-2 rounded-xl bg-gray-800 text-white font-bold hover:bg-black">Save</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800">{showModal === 'decrease' ? 'Decrease Balance' : showModal}</h2>
                                <p className="mb-4 text-gray-500">
                                    {showModal === 'decrease' ? 'How much to remove?' : `How much ${showModal === 'reward' ? 'earned' : 'lost'}?`}
                                </p>

                                <input
                                    type="number"
                                    placeholder="Amount"
                                    className="w-full p-4 bg-gray-50 rounded-xl mb-4 text-3xl font-bold outline-none focus:ring-2 ring-lavender text-gray-800"
                                    autoFocus
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Description (Optional)"
                                    className="w-full p-4 bg-gray-50 rounded-xl mb-6 outline-none focus:ring-2 ring-lavender"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />

                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setShowModal(null)} className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-100">Cancel</button>
                                    <button
                                        onClick={handleTransaction}
                                        className={`px-6 py-2 rounded-xl font-bold text-white shadow-md ${showModal === 'reward' ? 'bg-mint text-green-900 hover:bg-green-300' : 'bg-rose text-red-900 hover:bg-red-300'}`}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
