import { useState, useEffect } from 'react';
import { Edit2, Check, Plus, X, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PermanentQuadrants({
    allTasks,
    permanentIds,
    onTogglePermanent,
    onUpdateTask,
    onDeleteTask,
    isEditMode,
    setIsEditMode
}) {
    const navigate = useNavigate();
    const [showEmptyAlert, setShowEmptyAlert] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const rewards = allTasks.filter(t => t.type === 'reward' || t.type === 'split');
    const punishments = allTasks.filter(t => t.type === 'punishment' || t.type === 'split');

    const selectedRewards = rewards.filter(t => permanentIds.includes(t.id));
    const selectedPunishments = punishments.filter(t => permanentIds.includes(t.id));

    // Fillers
    const rewardSlots = [...selectedRewards, ...Array(4 - selectedRewards.length).fill(null)].slice(0, 4);
    const punishmentSlots = [...selectedPunishments, ...Array(4 - selectedPunishments.length).fill(null)].slice(0, 4);

    const handleToggleEdit = () => {
        if (!isEditMode && rewards.length === 0 && punishments.length === 0) {
            setShowEmptyAlert(true);
            return;
        }
        setIsEditMode(!isEditMode);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={handleToggleEdit}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isEditMode ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
                >
                    {isEditMode ? <Check size={18} /> : <Edit2 size={18} />}
                    {isEditMode ? 'Done Selection' : 'Edit Permanent Tasks'}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Rewards Quadrant */}
                <QuadrantCard
                    title="Permanent Rewards"
                    type="reward"
                    slots={rewardSlots}
                    allOptions={rewards}
                    isEditMode={isEditMode}
                    permanentIds={permanentIds}
                    onToggle={onTogglePermanent}
                    onEdit={setEditingTask}
                    onDelete={onDeleteTask}
                    colorClass="bg-mint text-green-900"
                />

                {/* Punishments Quadrant */}
                <QuadrantCard
                    title="Permanent Punishments"
                    type="punishment"
                    slots={punishmentSlots}
                    allOptions={punishments}
                    isEditMode={isEditMode}
                    permanentIds={permanentIds}
                    onToggle={onTogglePermanent}
                    onEdit={setEditingTask}
                    onDelete={onDeleteTask}
                    colorClass="bg-rose text-red-900"
                />
            </div>

            {/* Empty Alert Modal */}
            {showEmptyAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 border border-white/20">
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-black mb-2">No Tasks Available</h3>
                                <p className="text-gray-600 text-sm">
                                    You haven't added any Rewards or Punishments yet.
                                    <br />
                                    Go to Home to create some first!
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <button onClick={() => navigate('/')} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">Go to Home</button>
                                <button onClick={() => setShowEmptyAlert(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={(updated) => {
                        onUpdateTask(updated);
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
}

function QuadrantCard({ title, type, slots, allOptions, isEditMode, permanentIds, onToggle, onEdit, onDelete, colorClass }) {
    const isReward = type === 'reward';
    const textColor = isReward ? 'text-green-800' : 'text-red-800';
    const borderColor = isReward ? 'border-green-500' : 'border-red-500';
    const lineColor = isReward ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <h3 className={`text-xl font-bold mb-4 text-center ${textColor} text-outline-white`}>
                {title}
            </h3>

            {isEditMode ? (
                <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 p-2">
                    <p className="text-xs text-center opacity-60 mb-2">Select to add • Edit • Delete</p>
                    {allOptions.length === 0 ? (
                        <p className="text-center text-sm opacity-50">No {type}s available. Add some in Home!</p>
                    ) : (
                        allOptions.map(task => (
                            <div
                                key={task.id}
                                className={`w-full p-2 rounded-lg flex justify-between items-center transition-all ${permanentIds.includes(task.id) ? `${colorClass} shadow-sm border border-black/10` : 'bg-white/50 border border-gray-100'}`}
                            >
                                <button
                                    onClick={() => onToggle(task.id, type)}
                                    className="flex-1 text-left text-sm font-medium flex items-center gap-2"
                                >
                                    {permanentIds.includes(task.id) ? <Check size={16} /> : <div className="w-4 h-4 rounded-full border border-gray-300"></div>}
                                    <span className="truncate">{task.name}</span>
                                </button>

                                <div className="flex items-center gap-1 pl-2 border-l border-black/10 dark:border-white/10 ml-2">
                                    <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-black/10 rounded-full transition-colors text-black" title="Edit">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => onDelete(task.id)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-full transition-colors" title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className={`flex-1 grid grid-cols-2 grid-rows-2 gap-0 border-2 ${borderColor} rounded-xl overflow-hidden min-h-[250px] relative`}>
                    {/* The Cross Lines */}
                    <div className={`absolute top-1/2 left-0 w-full h-0.5 ${lineColor} transform -translate-y-1/2`}></div>
                    <div className={`absolute top-0 left-1/2 h-full w-0.5 ${lineColor} transform -translate-x-1/2`}></div>

                    {slots.map((task, i) => (
                        <div key={i} className="flex items-center justify-center p-2 text-center relative">
                            {task ? (
                                <div className={`text-sm font-bold ${textColor} text-outline-white`}>
                                    {task.name}
                                    <div className={`text-xs opacity-75 mt-1 ${textColor} font-bold`}>
                                        {/* Show correct value based on task type within this quadrant context */}
                                        {type === 'reward' ? '+' : '-'}{task.valueType === 'money' ? `₹${type === 'reward' ? task.rewardValue : task.punishmentValue}` : '🌟'}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-black text-xs text-outline-white font-bold">Empty</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EditTaskModal({ task, onClose, onSave }) {
    // We only allow editing fields relevant to the task's ORIGINAL type or logic.
    // If it's a 'split' task, we show both? Or just the parts relevant?
    // User wants to edit "task definition, description, amount".
    // We'll init state with task props.

    const [name, setName] = useState(task.name);
    const [valueType, setValueType] = useState(task.valueType || 'money');

    // Values
    const [rewardValue, setRewardValue] = useState(task.rewardValue || 0);
    const [punishmentValue, setPunishmentValue] = useState(task.punishmentValue || 0);
    const [rewardDescription, setRewardDescription] = useState(task.rewardDescription || '');
    const [punishmentDescription, setPunishmentDescription] = useState(task.punishmentDescription || '');

    const handleSave = () => {
        onSave({
            ...task,
            name,
            valueType,
            rewardValue,
            punishmentValue,
            rewardDescription,
            punishmentDescription
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-black dark:text-white">Edit Task</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Task Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-2 mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white"
                        />
                    </div>

                    {/* Only show relevant fields based on Task Type */}
                    {(task.type === 'reward' || task.type === 'split') && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl space-y-2">
                            <label className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Reward Details</label>

                            <div className="flex gap-2">
                                <button onClick={() => setValueType('money')} className={`flex-1 py-1 text-xs font-bold rounded ${valueType === 'money' ? 'bg-green-500 text-white' : 'bg-white text-gray-500'}`}>Money</button>
                                <button onClick={() => setValueType('other')} className={`flex-1 py-1 text-xs font-bold rounded ${valueType === 'other' ? 'bg-green-500 text-white' : 'bg-white text-gray-500'}`}>Descr.</button>
                            </div>

                            {valueType === 'money' ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-green-700">₹</span>
                                    <input type="number" value={rewardValue} onChange={e => setRewardValue(e.target.value)} className="w-full p-2 rounded-lg border border-green-200" />
                                </div>
                            ) : (
                                <input type="text" value={rewardDescription} onChange={e => setRewardDescription(e.target.value)} className="w-full p-2 rounded-lg border border-green-200" placeholder="e.g. Watch Movie" />
                            )}
                        </div>
                    )}

                    {(task.type === 'punishment' || task.type === 'split') && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl space-y-2">
                            <label className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">Punishment Details</label>
                            <div className="flex gap-2">
                                <button onClick={() => setValueType('money')} className={`flex-1 py-1 text-xs font-bold rounded ${valueType === 'money' ? 'bg-red-500 text-white' : 'bg-white text-gray-500'}`}>Money</button>
                                <button onClick={() => setValueType('other')} className={`flex-1 py-1 text-xs font-bold rounded ${valueType === 'other' ? 'bg-red-500 text-white' : 'bg-white text-gray-500'}`}>Descr.</button>
                            </div>
                            {valueType === 'money' ? (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-red-700">₹</span>
                                    <input type="number" value={punishmentValue} onChange={e => setPunishmentValue(e.target.value)} className="w-full p-2 rounded-lg border border-red-200" />
                                </div>
                            ) : (
                                <input type="text" value={punishmentDescription} onChange={e => setPunishmentDescription(e.target.value)} className="w-full p-2 rounded-lg border border-red-200" placeholder="e.g. 50 Pushups" />
                            )}
                        </div>
                    )}

                    <button onClick={handleSave} className="w-full py-3 bg-black text-white hover:bg-gray-800 rounded-xl font-bold flex items-center justify-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
