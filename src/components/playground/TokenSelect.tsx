import React, { useState, useRef, useEffect } from 'react';
import { resolveTokenValue } from '../../utils/core';

interface TokenSelectProps {
    label: string;
    value: string;
    tokens: any[];
    tokenMap?: Record<string, string>;
    onChange: (val: string) => void;
    type?: string;
}

export const TokenSelect = ({ label, value, tokens, tokenMap = {}, onChange, type }: TokenSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedToken = tokens.find(t => t.name === value);

    // Helper to resolve value for preview
    const getResolvedValue = (tokenValue: string) => {
        return resolveTokenValue(tokenValue, tokenMap);
    };

    const isColor = type === 'color' || (selectedToken?.type === 'color');

    return (
        <div className="ftd-playground-control" ref={containerRef}>
            <label className="ftd-playground-label">{label}</label>

            <div className="ftd-custom-select-container">
                {/* Trigger */}
                <div
                    className={`ftd-custom-select-trigger ${isOpen ? 'is-open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="ftd-custom-select-value">
                        {selectedToken ? (
                            <>
                                {isColor && (
                                    <div
                                        className="ftd-color-swatch-sm"
                                        style={{ backgroundColor: getResolvedValue(selectedToken.value) }}
                                    />
                                )}
                                <span>{selectedToken.name}</span>
                            </>
                        ) : (
                            <span className="ftd-text-muted">Select Token</span>
                        )}
                    </div>
                    <svg className="ftd-custom-select-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="ftd-custom-select-dropdown">
                        {tokens.map((t: any) => {
                            const resolved = getResolvedValue(t.value);
                            const showSwatch = type === 'color' || t.type === 'color';

                            return (
                                <div
                                    key={t.name}
                                    className={`ftd-custom-option ${t.name === value ? 'is-selected' : ''}`}
                                    onClick={() => {
                                        onChange(t.name);
                                        setIsOpen(false);
                                    }}
                                >
                                    {showSwatch && (
                                        <div
                                            className="ftd-color-swatch-sm"
                                            style={{ backgroundColor: resolved }}
                                        />
                                    )}
                                    <span>{t.name}</span>
                                    <span className="ftd-token-value-preview">
                                        {resolved}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
