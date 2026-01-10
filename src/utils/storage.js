const STORAGE_KEY = 'sweet_treat_transactions';
const SETTINGS_KEY = 'sweet_treat_settings';

export const getTransactions = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction) => {
    const transactions = getTransactions();
    const newTransaction = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...transaction
    };
    transactions.push(newTransaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return newTransaction;
};

export const getBalance = () => {
    const transactions = getTransactions();
    return transactions.reduce((acc, curr) => {
        if (curr.type === 'reward' && !curr.isDiscarded) {
            return acc + Number(curr.amount);
        } else if (curr.type === 'punishment') {
            return acc - Number(curr.amount);
        }
        return acc;
    }, 0);
};

export const getSettings = () => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { currency: '₹', customCurrency: '' };
};

export const saveSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getNetBalance = () => {
    const transactions = getTransactions();
    return transactions.reduce((acc, curr) => {
        // Sum only Rewards that are NOT currency adjustments
        // We identify currency adjustments by description for now as per previous implementation plan or just description heuristic
        // Or better, we can check if description includes "Currency Conversion"
        if (curr.type === 'reward' && !curr.isDiscarded && !curr.description.includes('Currency Conversion Adjustment')) {
            return acc + Number(curr.amount);
        }
        return acc;
    }, 0);
};

export const checkMonthlyReset = () => {
    const LAST_RESET_KEY = 'sweet_treat_last_reset';
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const now = Date.now();

    if (!lastReset) {
        localStorage.setItem(LAST_RESET_KEY, now.toString()); // First run / init
        return;
    }

    if (now - parseInt(lastReset) > THIRTY_DAYS_MS) {
        // Time to reset
        clearHistory(); // Wipes transactions

        // Add a system note (though clearHistory wiped it, we can start fresh)
        saveTransaction({
            type: 'reward', // Neutral or specific type? 'reward' adds to balance. 
            // Wait, clearHistory removes EVERYTHING including balance. 
            // Usually "statement reset" implies clearing the LOG, but does balance carry over?
            // "Reset the statement" - statement usually shows transactions.
            // If we clearHistory, balance becomes 0.
            // Let's assume balance consumes vanish too? Or should we preserve balance?
            // "Reset the statement every 30 days!" usually implies a fresh start.
            // I'll proceed with full clear.
            amount: 0,
            description: 'Balance Reset (Monthly Cycle)',
            isDiscarded: false
        });

        localStorage.setItem(LAST_RESET_KEY, now.toString());
        // Return true to indicate reset happened?
        return true;
    }
    return false;
};
