import { Linkedin, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-8 text-center text-gray-400 text-sm bg-gray-900 border-t border-gray-800 mt-auto">
            <div className="flex justify-center gap-6 mb-4">
                <a href="#" className="p-2 bg-gray-800 rounded-full text-white hover:text-blue-400 hover:bg-gray-700 hover:scale-110 transition-all shadow-sm"><Linkedin size={20} /></a>
                <a href="#" className="p-2 bg-gray-800 rounded-full text-white hover:text-pink-400 hover:bg-gray-700 hover:scale-110 transition-all shadow-sm"><Instagram size={20} /></a>
                <a href="#" className="p-2 bg-gray-800 rounded-full text-white hover:text-red-400 hover:bg-gray-700 hover:scale-110 transition-all shadow-sm"><Youtube size={20} /></a>
            </div>
            <p>© 2026 Harkeswanen. All rights reserved.</p>
        </footer>
    );
}
