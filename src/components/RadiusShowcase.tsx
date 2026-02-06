'use client';

import React, { useState, useCallback } from 'react';
import type { RadiusShowcaseProps, ParsedRadiusToken } from '../types';
import { parseRadiusTokens, copyToClipboard } from '../utils';

/**
 * RadiusShowcase - Visual demonstration of border radius tokens
 * Shows boxes with actual border radius applied
 */
export function RadiusShowcase({ tokens, onTokenClick }: RadiusShowcaseProps) {
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const radiusTokens = parseRadiusTokens(tokens);

    const showToast = useCallback((value: string) => {
        setCopiedValue(value);
        setTimeout(() => setCopiedValue(null), 2000);
    }, []);

    const handleCopy = useCallback(async (token: ParsedRadiusToken) => {
        const success = await copyToClipboard(token.value);
        if (success) {
            showToast(token.value);
        }
        onTokenClick?.(token);
    }, [onTokenClick, showToast]);

    if (radiusTokens.length === 0) {
        return (
            <div className="ftd-empty">
                <div className="ftd-empty-icon">⬜</div>
                <h4 className="ftd-empty-title">No radius tokens found</h4>
                <p className="ftd-empty-text">Add radius tokens to your tokens.json file</p>
            </div>
        );
    }

    return (
        <div className="ftd-section">
            <div className="ftd-section-header">
                <div className="ftd-section-icon">⬜</div>
                <h2 className="ftd-section-title">Border Radius</h2>
                <span className="ftd-section-count">{radiusTokens.length} tokens</span>
            </div>

            <div className="ftd-radius-grid">
                {radiusTokens.map((token) => (
                    <div key={token.name} className="ftd-radius-item" data-token-name={token.name}>
                        <div className="ftd-radius-preview-container">
                            <div
                                className="ftd-radius-preview"
                                style={{ borderRadius: token.value }}
                            />
                        </div>
                        <p className="ftd-radius-label">{token.name}</p>
                        <div className="ftd-token-values-row">
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

export default RadiusShowcase;
