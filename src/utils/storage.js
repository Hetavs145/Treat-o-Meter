import { queueCloudPush } from './cloudSync';

const STORAGE_KEY = 'sweet_treat_transactions';
const SETTINGS_KEY = 'sweet_treat_settings';
const TASKS_KEY = 'sweet_treat_tasks';
const PERMANENT_IDS_KEY = 'sweet_treat_permanent_ids';
const PERMANENT_LOGS_KEY = 'sweet_treat_permanent_logs';

function readJSON(key, fallback) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    queueCloudPush();
}

export const getTransactions = () => readJSON(STORAGE_KEY, []);

export const saveTransaction = (transaction) => {
    const transactions = getTransactions();
    const newTransaction = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...transaction
    };
    transactions.push(newTransaction);
    writeJSON(STORAGE_KEY, transactions);
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

export const getSettings = () => readJSON(SETTINGS_KEY, { currency: '₹', customCurrency: '' });

export const saveSettings = (settings) => writeJSON(SETTINGS_KEY, settings);

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    queueCloudPush();
};

export const getNetBalance = () => {
    const transactions = getTransactions();
    return transactions.reduce((acc, curr) => {
        // Sum only Rewards that are NOT currency adjustments
        if (curr.type === 'reward' && !curr.isDiscarded && !curr.description.includes('Currency Conversion Adjustment')) {
            return acc + Number(curr.amount);
        }
        return acc;
    }, 0);
};

// --- Tasks (active/queued tasks shown on the Home tab) ---
export const getTasks = () => readJSON(TASKS_KEY, []);
export const saveTasks = (tasks) => writeJSON(TASKS_KEY, tasks);

// --- Permanent habits ---
export const getPermanentIds = () => readJSON(PERMANENT_IDS_KEY, []);
export const savePermanentIds = (ids) => writeJSON(PERMANENT_IDS_KEY, ids);

// Logs shape: { "2024-01-09": { "taskId1": "completed" } }
export const getPermanentLogs = () => readJSON(PERMANENT_LOGS_KEY, {});
export const savePermanentLogs = (logs) => writeJSON(PERMANENT_LOGS_KEY, logs);
