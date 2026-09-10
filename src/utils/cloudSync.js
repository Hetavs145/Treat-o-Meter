import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// All local keys that make up a user's data and should be mirrored to Firestore.
const SYNCED_KEYS = [
    'sweet_treat_transactions',
    'sweet_treat_settings',
    'sweet_treat_tasks',
    'sweet_treat_permanent_ids',
    'sweet_treat_permanent_logs',
];

const LOCAL_UPDATED_AT_KEY = 'sweet_treat_local_updated_at';
const PUSH_DEBOUNCE_MS = 1000;

let currentUid = null;
let pushTimer = null;

function readLocalSnapshot() {
    const snapshot = {};
    for (const key of SYNCED_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw !== null) snapshot[key] = raw;
    }
    return snapshot;
}

function writeLocalSnapshot(snapshot) {
    for (const key of SYNCED_KEYS) {
        if (snapshot[key] !== undefined) {
            localStorage.setItem(key, snapshot[key]);
        }
    }
}

function getLocalUpdatedAt() {
    return Number(localStorage.getItem(LOCAL_UPDATED_AT_KEY) || 0);
}

function markLocalUpdated(atMs = Date.now()) {
    localStorage.setItem(LOCAL_UPDATED_AT_KEY, String(atMs));
    return atMs;
}

function userDocRef(uid) {
    return doc(db, 'users', uid, 'appData', 'main');
}

/** Call once auth resolves (or clears) to scope future syncs to this user. */
export function setCloudSyncUser(uid) {
    currentUid = uid;
    if (pushTimer) {
        clearTimeout(pushTimer);
        pushTimer = null;
    }
}

/**
 * Pulls the user's cloud snapshot down. If the cloud copy is newer than
 * whatever was last edited on this device, it overwrites local storage.
 * If this device has newer (e.g. offline) edits, it pushes them up instead.
 * Returns true if local data changed as a result.
 */
export async function pullCloudData(uid) {
    if (!uid) return false;
    const snap = await getDoc(userDocRef(uid));
    if (!snap.exists()) {
        // Nothing in the cloud yet — seed it from whatever is local.
        await pushCloudData();
        return false;
    }

    const data = snap.data();
    const cloudUpdatedAt = data.updatedAtMs || 0;
    const localUpdatedAt = getLocalUpdatedAt();

    if (cloudUpdatedAt > localUpdatedAt) {
        writeLocalSnapshot(data.payload || {});
        markLocalUpdated(cloudUpdatedAt);
        return true;
    }

    if (localUpdatedAt > 0) {
        await pushCloudData();
    }
    return false;
}

/** Pushes the current local snapshot to Firestore for the active user, debounced. */
export function queueCloudPush() {
    markLocalUpdated();
    if (!currentUid) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
        pushCloudData();
    }, PUSH_DEBOUNCE_MS);
}

export async function pushCloudData() {
    if (!currentUid) return;
    const payload = readLocalSnapshot();
    const updatedAtMs = getLocalUpdatedAt() || markLocalUpdated();
    try {
        await setDoc(userDocRef(currentUid), {
            payload,
            updatedAtMs,
            updatedAt: serverTimestamp(),
        });
    } catch (err) {
        // Data is still safe locally; sync will retry on the next change.
        console.error('Cloud sync failed, data remains saved locally:', err);
    }
}
