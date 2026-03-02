'use client';

import React, { useState, useRef, useEffect } from 'react';

export type CopyFormat = 'css' | 'scss' | 'tailwind';

interface FormatSelectorProps {
    format: CopyFormat;
    onChange: (format: CopyFormat) => void;
}

export function FormatSelector({ format, onChange }: FormatSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const formatLabels: Record<CopyFormat, string> = {
        css: 'CSS Variables',
        scss: 'SCSS Variables',
        tailwind: 'Tailwind Classes',
    };

    const handleSelect = (newFormat: CopyFormat) => {
        onChange(newFormat);
        setIsOpen(false);
    };

    return (
        <div className="ftd-format-selector" ref={dropdownRef}>
            <button
                className="ftd-format-button"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                aria-label="Select copy format"
                title="Choose variable format for copying"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{formatLabels[format]}</span>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div className="ftd-format-dropdown">
                    {(['css', 'scss', 'tailwind'] as CopyFormat[]).map((fmt) => (
                        <button
                            key={fmt}
                            className={`ftd-format-option ${format === fmt ? 'active' : ''}`}
                            onClick={() => handleSelect(fmt)}
                            type="button"
                        >
                            <span>{formatLabels[fmt]}</span>
                            <svg
                                className="ftd-format-check"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
