'use client';

import React, { useState, useCallback } from 'react';
import type { SizeScaleProps, ParsedSizeToken } from '../types';
import { parseSizeTokens, copyToClipboard } from '../utils';

/**
 * SizeScale - Visual representation of size tokens
 * Shows vertical bars with proportional heights and horizontal bars
 */
export function SizeScale({ tokens, onTokenClick }: SizeScaleProps) {
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const sizeTokens = parseSizeTokens(tokens);
    const maxValue = Math.max(...sizeTokens.map(t => t.numericValue), 1);

    const showToast = useCallback((value: string) => {
        setCopiedValue(value);
        setTimeout(() => setCopiedValue(null), 2000);
    }, []);

    const handleCopy = useCallback(async (token: ParsedSizeToken) => {
        const success = await copyToClipboard(token.value);
        if (success) {
            showToast(token.value);
        }
        onTokenClick?.(token);
    }, [onTokenClick, showToast]);

    if (sizeTokens.length === 0) {
        return (
            <div className="ftd-empty">
                <div className="ftd-empty-icon">📐</div>
                <h4 className="ftd-empty-title">No size tokens found</h4>
                <p className="ftd-empty-text">Add size tokens to your tokens.json file</p>
            </div>
        );
    }

    return (
        <div className="ftd-section">
            <div className="ftd-section-header">
                <div className="ftd-section-icon">📐</div>
                <h3 className="ftd-section-title">Size Scale</h3>
                <span className="ftd-section-count">{sizeTokens.length} tokens</span>
            </div>

            {/* Vertical bar chart (Visual Preview) */}
            <div className="ftd-size-grid">
                {sizeTokens.map((token) => {
                    const heightPercent = (token.numericValue / maxValue) * 180;

                    return (
                        <div key={token.name} className="ftd-size-item">
                            <div
                                className="ftd-size-bar"
                                style={{
                                    height: `${Math.max(heightPercent, 8)}px`,
                                    width: '32px',
                                }}
                                onClick={() => handleCopy(token)}
                                title={`Click to copy: ${token.value}`}
                            />
                            <span className="ftd-size-label">{token.name}</span>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Token List */}
            <div className="ftd-spacing-list">
                {sizeTokens.map((token) => (
                    <div key={token.name} className="ftd-spacing-item">
                        <span className="ftd-spacing-label">{token.name}</span>
                        <div className="ftd-spacing-bar-container">
                            <div
                                className="ftd-spacing-bar"
                                style={{ width: `${(token.numericValue / maxValue) * 100}%` }}
                            />
                        </div>
                        <div className="ftd-token-values-row" style={{ flexDirection: 'row', gap: '8px', minWidth: 'fit-content' }}>
                            <span
                                className="ftd-token-css-var"
                                onClick={() => copyToClipboard(token.cssVariable).then(() => showToast(token.cssVariable))}
                                title={`Copy CSS: ${token.cssVariable}`}
                            >
                                {token.cssVariable}
                            </span>
                            <span
                                className="ftd-token-hex"
                                onClick={() => handleCopy(token)}
                                title={`Copy Value: ${token.value}`}
                                style={{ minWidth: '60px', textAlign: 'center' }}
                            >
                                {token.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Copy Toast */}
            {copiedValue && (
                <div className="ftd-copied-toast">
                    <div className="ftd-toast-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div className="ftd-toast-content">
                        <span className="ftd-toast-label">Copied</span>
                        <span className="ftd-toast-value">{copiedValue}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SizeScale;
