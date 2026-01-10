import React from 'react';

export default function ChocolateDrip({ className = "" }) {
    return (
        <div className={`absolute top-0 left-0 w-full h-16 z-0 pointer-events-none overflow-hidden ${className}`}>
            <svg
                className="w-full h-full transform origin-top animate-melt"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,0V46.29c47,0,47,40,94,40s47-40,94-40,47,40,94,40,47-40,94-40,47,40,94,40,47-40,94-40,47,40,94,40,47-40,94-40,47,40,94,40,47-40,94-40,47,40,94,40,47-40,94-40,47,40,94,40V0Z"
                    fill="#5D4037"
                    className="drop-shadow-sm opacity-90"
                />
            </svg>
        </div>
    );
}
