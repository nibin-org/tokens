import React, { useState, useMemo } from 'react';
import type { FigmaTokens } from '../../types';
import { getFlattenedTokens, ExportableToken } from '../../utils/exportUtils';
import { resolveTokenValue } from '../../utils/core';

interface ButtonPlaygroundProps {
    tokens: FigmaTokens;
    tokenMap: Record<string, string>;
}

export function ButtonPlayground({ tokens, tokenMap }: ButtonPlaygroundProps) {
    // Flatten tokens to get robust CSS variables and raw values
    const allTokens = useMemo(() => getFlattenedTokens(tokens), [tokens]);

    // Initial default values (using generic names likely to exist, or fallbacks)
    const [config, setConfig] = useState({
        backgroundColor: 'fill-default', // guessed name, will fallback gracefully
        textColor: 'text-default',
        borderColor: 'transparent',
        borderRadius: 'radius-sm',
        padding: 'space-md',
        fontSize: 'size-md',
    });

    // Helper to find filtered tokens
    const findTokensByType = (type: string, categoryPrefix?: string) => {
        return allTokens.filter(t => {
            const isTypeMatch = t.type === type;
            const isCategoryMatch = categoryPrefix
                ? t.name.startsWith(categoryPrefix) || t.name.includes(categoryPrefix)
                : true;
            return isTypeMatch && isCategoryMatch;
        });
    };

    // Specific Semantic Filters using flat names
    // Note: getFlattenedTokens categorizes them. We can also filter by name convention.
    const fillTokens = useMemo(() => allTokens.filter(t => t.type === 'color' && (t.name.includes('fill') || t.name.includes('bg'))), [allTokens]);
    const textTokens = useMemo(() => allTokens.filter(t => t.type === 'color' && t.name.includes('text')), [allTokens]);
    const strokeTokens = useMemo(() => allTokens.filter(t => t.type === 'color' && (t.name.includes('stroke') || t.name.includes('border'))), [allTokens]);

    // For dimensions, we often rely on types
    const radiusTokens = useMemo(() => allTokens.filter(t => t.type === 'radius'), [allTokens]);
    const spacingTokens = useMemo(() => allTokens.filter(t => t.type === 'spacing'), [allTokens]);
    const sizeTokens = useMemo(() => allTokens.filter(t => t.type === 'typography' || t.name.includes('size')), [allTokens]);

    // Update config helper
    const updateConfig = (key: keyof typeof config, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    // --- Resolution Helpers ---

    const getTokenByName = (name: string) => {
        return allTokens.find(t => t.name === name);
    };

    // Get value for the CODE SNIPPET (CSS Variable)
    const getCssValue = (name: string, fallback: string = 'initial') => {
        if (name === 'transparent' || name === 'none') return name;
        const token = getTokenByName(name);
        return token ? `var(${token.cssVariable})` : fallback;
    };

    // Get value for the PREVIEW (Resolved Hex/Px)
    const getPreviewValue = (name: string, fallback: string = 'initial') => {
        if (name === 'transparent' || name === 'none') return name;
        const token = getTokenByName(name);
        if (!token) return fallback;
        // Resolve the token value (which might be an alias like {base.color.blue})
        return resolveTokenValue(token.value, tokenMap);
    };

    // Generate CSS snippet
    const cssSnippet = `
    .my - button {
    background - color: ${getCssValue(config.backgroundColor, 'var(--fill-default)')};
    color: ${getCssValue(config.textColor, 'var(--text-default)')};
    border: 1px solid ${getCssValue(config.borderColor, 'transparent')};
    border - radius: ${getCssValue(config.borderRadius, '8px')};
    padding: ${getCssValue(config.padding, '12px 24px')};
    font - size: ${getCssValue(config.fontSize, '16px')};
    cursor: pointer;
    transition: all 0.2s ease;
} `;

    const TokenSelect = ({ label, value, tokens, onChange }: { label: string, value: string, tokens: any[], onChange: (val: string) => void }) => {
        return (
            <div className="ftd-playground-control">
                <label className="ftd-playground-label">{label}</label>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="ftd-playground-select"
                >
                    <option value="" disabled>Select Token</option>
                    {tokens.map((t: any) => (
                        // Use Token Name as the value
                        <option key={t.name} value={t.name}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>
        )
    }

    return (
        <div className="ftd-playground-layout">
            <div className="ftd-playground-sidebar">
                <h3 className="ftd-playground-title">Properties</h3>

                <TokenSelect
                    label="Background Color"
                    value={config.backgroundColor}
                    tokens={fillTokens}
                    onChange={(v) => updateConfig('backgroundColor', v)}
                />

                <TokenSelect
                    label="Text Color"
                    value={config.textColor}
                    tokens={textTokens}
                    onChange={(v) => updateConfig('textColor', v)}
                />

                <TokenSelect
                    label="Border Color"
                    value={config.borderColor}
                    tokens={strokeTokens}
                    onChange={(v) => updateConfig('borderColor', v)}
                />

                <TokenSelect
                    label="Border Radius"
                    value={config.borderRadius}
                    tokens={radiusTokens}
                    onChange={(v) => updateConfig('borderRadius', v)}
                />

                <TokenSelect
                    label="Padding"
                    value={config.padding}
                    tokens={spacingTokens}
                    onChange={(v) => updateConfig('padding', v)}
                />

                <TokenSelect
                    label="Font Size"
                    value={config.fontSize}
                    tokens={sizeTokens}
                    onChange={(v) => updateConfig('fontSize', v)}
                />
            </div>

            <div className="ftd-playground-preview-area">
                <div className="ftd-playground-canvas">
                    <button
                        style={{
                            backgroundColor: getPreviewValue(config.backgroundColor, '#3b82f6'),
                            color: getPreviewValue(config.textColor, '#ffffff'),
                            borderColor: getPreviewValue(config.borderColor, 'transparent'),
                            borderWidth: '1px',
                            borderStyle: config.borderColor === 'transparent' ? 'none' : 'solid',
                            borderRadius: getPreviewValue(config.borderRadius, '8px'),
                            padding: getPreviewValue(config.padding, '12px 24px'),
                            fontSize: getPreviewValue(config.fontSize, '16px'),
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Button Preview
                    </button>
                </div>

                <div className="ftd-playground-code">
                    <div className="ftd-code-header">CSS</div>
                    <pre>
                        <code>{cssSnippet}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
