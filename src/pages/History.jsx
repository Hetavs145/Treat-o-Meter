import { useState, useEffect, useRef } from 'react';
import { getTransactions, clearHistory, getBalance } from '../utils/storage';
import { Download, Trash2, Filter, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'reward', 'punishment', 'conversion'
    const printRef = useRef();

    useEffect(() => {
        setTransactions(getTransactions().reverse());
    }, []);

    const isConversion = (t) => t.description && (t.description.includes('Currency Conversion Adjustment') || t.description.includes('Balance Reset'));

    const filteredData = transactions.filter(t => {
        if (filter === 'all') return true; // Include EVERYTHING in All
        if (filter === 'conversion') return isConversion(t);

        if (isConversion(t)) return false; // Exclude conversions/resets from specific Reward/Punishment tabs

        return t.type === filter;
    });

    // Calculate Monthly Net Credits (Rewards only, excluding conversions)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyNetCredits = transactions.reduce((acc, t) => {
        const d = new Date(t.timestamp);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            if (t.type === 'reward' && !t.isDiscarded && !isConversion(t)) {
                return acc + Number(t.amount);
            }
        }
        return acc;
    }, 0);

    const [showErrorModal, setShowErrorModal] = useState(false);

    const exportPDF = async () => {
        const wasDark = document.documentElement.classList.contains('dark');
        try {
            const element = printRef.current;
            if (!element) {
                console.error("Print reference not found");
                setShowErrorModal(true);
                return;
            }

            // Temporarily force Light Mode for PDF generation to ensure black text on white paper
            if (wasDark) {
                document.documentElement.classList.remove('dark');
                // Allow a tiny tick for styles to recalculate
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Apply Strict Black & White Mode
            element.classList.add('pdf-mode');

            // Javascript Force-Clear Backgrounds (To ensure Watermark Visibility)
            // Javascript Force-Clear Backgrounds (To ensure Watermark Visibility)
            const originalBackground = element.style.background;
            element.style.setProperty('background', 'transparent', 'important');

            const items = element.querySelectorAll('.transaction-item');
            items.forEach(item => {
                // Store original inline style (if any)
                item.dataset.originalBg = item.style.background;
                // Force transparent with priority
                item.style.setProperty('background', 'transparent', 'important');
                // Replace rounded card look with simple line separator
                item.style.borderBottom = '1px solid #000';
                item.style.borderRadius = '0';
                item.style.borderRadius = '0';
                item.style.boxShadow = 'none';

                // Fix Text Clashing in List Items
                const rightSide = item.querySelector('.text-right') || item.lastElementChild;
                if (rightSide) {
                    rightSide.style.setProperty('margin-left', '20px', 'important');
                    rightSide.style.setProperty('white-space', 'nowrap', 'important');
                }
            });

            // Fix Header Text Clashing (Net Credits)
            const headerRight = element.querySelector('.text-right');
            if (headerRight) {
                const paragraphs = headerRight.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.style.setProperty('margin-bottom', '8px', 'important');
                    p.style.setProperty('line-height', '1.5', 'important');
                });
            }

            // Force Watermark Visibility (JS Override)
            const watermarks = element.querySelectorAll('.watermark-text');
            watermarks.forEach(wm => {
                wm.dataset.originalOpacity = wm.style.opacity;
                wm.style.setProperty('opacity', '0.15', 'important');
                wm.style.setProperty('color', '#000000', 'important');
            });

            console.log("Cleared backgrounds and enforced watermark.");

            // Wait for Repaint
            await new Promise(resolve => setTimeout(resolve, 200));

            console.log("Starting PDF generation with html-to-image...", element);

            const dataUrl = await toPng(element, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                cacheBust: true,
            });

            console.log("Image generated");

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;
            const pdfHeight = (elementHeight * pdfWidth) / elementWidth;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`monthly_expense_${new Date().toISOString().split('T')[0]}.pdf`);

            console.log("PDF saved");

        } catch (error) {
            console.error('PDF Generation Error:', error);
            setShowErrorModal(true);
        } finally {
            // Restore Styles
            if (printRef.current) {
                const el = printRef.current;
                el.classList.remove('pdf-mode');
                el.style.background = ''; // Revert to CSS

                const items = el.querySelectorAll('.transaction-item');
                items.forEach(item => {
                    item.style.background = item.dataset.originalBg || '';
                    item.style.borderBottom = '';
                    item.style.borderRadius = '';
                    item.style.boxShadow = '';
                });

                const watermarks = el.querySelectorAll('.watermark-text');
                watermarks.forEach(wm => {
                    wm.style.opacity = wm.dataset.originalOpacity || '';
                    wm.style.color = '';
                });
            }
            // Restore Dark Mode if it was active
            if (wasDark) {
                document.documentElement.classList.add('dark');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full">
                        <Calendar className="text-black" fill="white" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-black text-outline-white">Monthly History</h2>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 border-gray-800 ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>All</button>
                    <button onClick={() => setFilter('reward')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 border-green-800 ${filter === 'reward' ? 'bg-mint text-green-800' : 'bg-white text-black'}`}>Rewards</button>
                    <button onClick={() => setFilter('punishment')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 border-red-800 ${filter === 'punishment' ? 'bg-rose text-red-800' : 'bg-white text-black'}`}>Punishments</button>
                    <button onClick={() => setFilter('conversion')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 border-blue-800 ${filter === 'conversion' ? 'bg-blue-100 text-blue-800' : 'bg-white text-black'}`}>Conversions</button>
                </div>
            </div>

            <div className="glass-card min-h-[500px] relative overflow-hidden" ref={printRef}>
                {/* Watermark Layer */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none flex flex-wrap content-start justify-center gap-4 p-0 overflow-hidden">
                    {Array.from({ length: 400 }).map((_, i) => (
                        <span key={i} className="watermark-text text-4xl font-black text-black transform -rotate-45 whitespace-nowrap opacity-[0.04]">
                            Harkeswanen
                        </span>
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6 p-4 border-b border-gray-100 dark:border-white/10">
                        <div>
                            <h3 className="text-lg font-bold text-black text-outline-white">Statement</h3>
                            <p className="text-xs text-black text-outline-white font-bold">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-black text-outline-white">Net Credits (Monthly)</p>
                            <p className="text-2xl font-bold text-black text-outline-white">₹{monthlyNetCredits.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredData.length === 0 ? (
                            <p className="text-center text-gray-400 py-12">No transactions found.</p>
                        ) : (
                            filteredData.map((t) => (
                                <div key={t.id} className="transaction-item flex items-center justify-between p-4 bg-white/90 rounded-xl hover:bg-white transition-colors shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isConversion(t) ? 'bg-blue-100' : t.type === 'reward' ? 'bg-mint' : 'bg-rose'}`}>
                                            {isConversion(t) ? '💱' : t.type === 'reward' ? '🍬' : '🌶️'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-black text-outline-white">{t.description || 'No Description'}</p>
                                            <p className="text-xs text-gray-500">
                                                {t.startTime && t.endTime ? (
                                                    // Time Range for Tasks
                                                    `${new Date(t.startTime).toLocaleTimeString()} - ${new Date(t.endTime).toLocaleTimeString()} (${new Date(t.endTime).toLocaleDateString()})`
                                                ) : (
                                                    // Fallback for old data or instant transactions
                                                    new Date(t.timestamp).toLocaleString()
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-lg ${t.type === 'reward' ? 'text-green-600' : 'text-red-500'}`}>
                                        {t.type === 'reward' ? '+' : '-'} ₹{Number(t.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                {/* <button onClick={clearHistory} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors">
            <Trash2 size={20} /> Clear Data
         </button> */}
                <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-3 bg-white text-black border border-black rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg btn-hover h-full">
                    <Download size={20} /> Save as PDF
                </button>
            </div>

            {/* ERROR MODAL */}
            {
                showErrorModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 border border-white/20">
                            <div className="text-center space-y-4">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-black dark:text-white mb-2">PDF Generation Failed</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        Something went wrong while creating your statement.
                                        <br />
                                        Please try again or check your console for details.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowErrorModal(false)}
                                    className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
