import React, { useState, useMemo } from 'react';
import type { FigmaTokens } from '../../types';
import { getFlattenedTokens, ExportableToken } from '../../utils/exportUtils';
import { resolveTokenValue } from '../../utils/core';
import { copyToClipboard } from '../../utils/ui';
import { TokenSelect } from './TokenSelect';
import type { PlaygroundConfig } from '../PlaygroundTab';

interface ButtonPlaygroundProps {
    tokens: FigmaTokens;
    tokenMap: Record<string, string>;
    config: PlaygroundConfig;
    setConfig: React.Dispatch<React.SetStateAction<PlaygroundConfig>>;
    activeTab: 'css' | 'scss' | 'tailwind';
    setActiveTab: React.Dispatch<React.SetStateAction<'css' | 'scss' | 'tailwind'>>;
    onReset: () => void;
}

export function ButtonPlayground({ tokens, tokenMap, config, setConfig, activeTab, setActiveTab, onReset }: ButtonPlaygroundProps) {
    // Flatten tokens to get robust CSS variables and raw values
    const allTokens = useMemo(() => getFlattenedTokens(tokens), [tokens]);
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [copied, setCopied] = useState(false);

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
    const textTokens = useMemo(() => allTokens.filter(t => t.type === 'color' && t.name.includes('text') && !t.name.includes('stroke')), [allTokens]);
    const strokeTokens = useMemo(() => allTokens.filter(t => t.type === 'color' && (t.name.includes('stroke') || t.name.includes('border'))), [allTokens]);

    // For dimensions, we often rely on types
    const radiusTokens = useMemo(() => allTokens.filter(t => t.type === 'radius'), [allTokens]);
    const spacingTokens = useMemo(() => allTokens.filter(t => t.type === 'spacing'), [allTokens]);
    const fontSizeTokens = useMemo(() => allTokens.filter(t => t.name.includes('font-size')), [allTokens]);
    const lineHeightTokens = useMemo(() => allTokens.filter(t => t.name.includes('line-height')), [allTokens]);

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
        if (!name || name === 'transparent' || name === 'none') return name || fallback;
        const token = getTokenByName(name);
        return token ? `var(${token.cssVariable})` : fallback;
    };

    const getScssValue = (name: string, fallback: string = 'initial') => {
        if (!name || name === 'transparent' || name === 'none') return name || fallback;
        if (name.startsWith('#') || name.startsWith('rgb')) return name; // Literal color
        return `$${name}`;
    };

    const getTailwindClass = (prop: string, tokenName: string) => {
        if (!tokenName || tokenName === 'none' || tokenName === 'transparent') return '';
        // Map props to tailwind prefixes
        // Assuming user has configured tailwind with these token names
        switch (prop) {
            case 'backgroundColor': return `bg-${tokenName}`;
            case 'textColor': return `text-${tokenName}`;
            case 'borderColor': return `border-${tokenName}`;
            case 'borderRadius': return `rounded-${tokenName}`; // or rounded-[token]
            case 'paddingX': return `px-${tokenName}`;
            case 'paddingY': return `py-${tokenName}`;
            case 'fontSize': return `text-${tokenName}`;
            case 'lineHeight': return `leading-${tokenName}`;
            case 'hoverBackgroundColor': return `hover:bg-${tokenName}`;
            case 'hoverTextColor': return `hover:text-${tokenName}`;
            case 'hoverBorderColor': return `hover:border-${tokenName}`;
            case 'activeBackgroundColor': return `active:bg-${tokenName}`;
            case 'activeTextColor': return `active:text-${tokenName}`;
            case 'activeBorderColor': return `active:border-${tokenName}`;
            default: return '';
        }
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
    // Generate Snippets
    const cssCode = useMemo(() => {
        const bgCss = getCssValue(config.backgroundColor, 'transparent');
        const textCss = getCssValue(config.textColor, '#000');
        const borderCss = getCssValue(config.borderColor, 'transparent');
        const radiusCss = getCssValue(config.borderRadius, '0');
        const paddingXCss = getCssValue(config.paddingX, '0');
        const paddingYCss = getCssValue(config.paddingY, '0');
        const fontSizeCss = getCssValue(config.fontSize, '16px');
        const lineHeightCss = config.lineHeight ? getCssValue(config.lineHeight, 'normal') : 'normal';

        // Hover values
        const hoverBgCss = getCssValue(config.hoverBackgroundColor, bgCss);
        const hoverTextCss = getCssValue(config.hoverTextColor, textCss);
        const hoverBorderCss = getCssValue(config.hoverBorderColor, borderCss);

        // Active values
        const activeBgCss = getCssValue(config.activeBackgroundColor, hoverBgCss);
        const activeTextCss = getCssValue(config.activeTextColor, hoverTextCss);
        const activeBorderCss = getCssValue(config.activeBorderColor, hoverBorderCss);

        const widthCss = config.isFullWidth ? 'width: 100%;' : '';
        const iconCss = config.showIcon ? `
.button-icon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}` : '';

        return `.button {
  background-color: ${bgCss};
  color: ${textCss};
  border: 1px solid ${borderCss};
  border-radius: ${radiusCss};
  padding: ${paddingYCss} ${paddingXCss};
  font-size: ${fontSizeCss};
  line-height: ${lineHeightCss};
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;${config.isFullWidth ? '\n  width: 100%;' : ''}
}

.button:hover {
  background-color: ${hoverBgCss};
  color: ${hoverTextCss};
  border-color: ${hoverBorderCss};
}

.button:active {
  background-color: ${activeBgCss};
  color: ${activeTextCss};
  border-color: ${activeBorderCss};
}${iconCss}`;
    }, [config]);

    const scssCode = useMemo(() => {
        const bgScss = getScssValue(config.backgroundColor, '$fill-default');
        const textScss = getScssValue(config.textColor, '$text-default');
        const borderScss = getScssValue(config.borderColor, 'transparent');
        const radiusScss = getScssValue(config.borderRadius, '0');
        const paddingXScss = getScssValue(config.paddingX, '0');
        const paddingYScss = getScssValue(config.paddingY, '0');
        const fontSizeScss = getScssValue(config.fontSize, '16px');
        const lineHeightScss = config.lineHeight ? getScssValue(config.lineHeight, 'normal') : 'normal';

        // Hover values
        const hoverBgScss = getScssValue(config.hoverBackgroundColor, bgScss);
        const hoverTextScss = getScssValue(config.hoverTextColor, textScss);
        const hoverBorderScss = getScssValue(config.hoverBorderColor, borderScss);

        // Active values
        const activeBgScss = getScssValue(config.activeBackgroundColor, hoverBgScss);
        const activeTextScss = getScssValue(config.activeTextColor, hoverTextScss);
        const activeBorderScss = getScssValue(config.activeBorderColor, hoverBorderScss);

        const widthScss = config.isFullWidth ? 'width: 100%;' : '';
        const iconScss = config.showIcon ? `
  .button-icon {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }` : '';

        return `.button {
  background-color: ${bgScss};
  color: ${textScss};
  border: 1px solid ${borderScss};
  border-radius: ${radiusScss};
  padding: ${paddingYScss} ${paddingXScss};
  font-size: ${fontSizeScss};
  line-height: ${lineHeightScss};
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;${config.isFullWidth ? '\n  width: 100%;' : ''}

  &:hover {
    background-color: ${hoverBgScss};
    color: ${hoverTextScss};
    border-color: ${hoverBorderScss};
  }

  &:active {
    background-color: ${activeBgScss};
    color: ${activeTextScss};
    border-color: ${activeBorderScss};
  }
${iconScss}
}`;
    }, [config]);

    const tailwindCode = useMemo(() => {
        const classes = [
            getTailwindClass('backgroundColor', config.backgroundColor),
            getTailwindClass('textColor', config.textColor),
            'border', // Tailwind border utility
            getTailwindClass('borderColor', config.borderColor),
            getTailwindClass('borderRadius', config.borderRadius),
            getTailwindClass('paddingX', config.paddingX),
            getTailwindClass('paddingY', config.paddingY),
            getTailwindClass('fontSize', config.fontSize),
            config.lineHeight ? getTailwindClass('lineHeight', config.lineHeight) : '',
            // Hover classes
            getTailwindClass('hoverBackgroundColor', config.hoverBackgroundColor),
            getTailwindClass('hoverTextColor', config.hoverTextColor),
            getTailwindClass('hoverBorderColor', config.hoverBorderColor),
            // Active classes
            getTailwindClass('activeBackgroundColor', config.activeBackgroundColor),
            getTailwindClass('activeTextColor', config.activeTextColor),
            getTailwindClass('activeBorderColor', config.activeBorderColor),
            'border transition-colors duration-200 flex items-center justify-center',
            config.isFullWidth ? 'w-full' : ''
        ].filter(Boolean).join(' ');

        const iconContent = config.showIcon ? `
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>` : '';

        return `<button className="${classes}">
${iconContent}
  ${config.buttonText || 'Button'}
</button>`;
    }, [config]);

    const codeSnippet = useMemo(() => {
        if (activeTab === 'css') {
            return cssCode;
        } else if (activeTab === 'scss') {
            return scssCode;
        } else {
            return tailwindCode;
        }
    }, [activeTab, cssCode, scssCode, tailwindCode]);

    const handleCopy = () => {
        copyToClipboard(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="ftd-playground-layout">
            <div className="ftd-playground-sidebar">
                <h3 className="ftd-playground-title">Properties</h3>

                <div className="ftd-playground-control-group" style={{ marginBottom: '16px' }}>
                    <label className="ftd-playground-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--ftd-text-secondary)' }}>
                        Button Text
                    </label>
                    <input
                        type="text"
                        value={config.buttonText}
                        onChange={(e) => updateConfig('buttonText', e.target.value)}
                        className="ftd-playground-input"
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--ftd-border)',
                            background: 'var(--ftd-bg-subtle)',
                            color: 'var(--ftd-text-main)',
                            fontSize: '13px'
                        }}
                    />
                </div>

                <div className="ftd-playground-control-row" style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ftd-text-main)', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.isFullWidth}
                            onChange={(e) => updateConfig('isFullWidth', e.target.checked as any)}
                            style={{ accentColor: 'var(--ftd-primary)' }}
                        />
                        Full Width
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ftd-text-main)', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.showIcon}
                            onChange={(e) => updateConfig('showIcon', e.target.checked as any)}
                            style={{ accentColor: 'var(--ftd-primary)' }}
                        />
                        Show Icon
                    </label>
                </div>

                <TokenSelect
                    label="Background Color"
                    value={config.backgroundColor}
                    tokens={fillTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('backgroundColor', v)}
                />

                <TokenSelect
                    label="Text Color"
                    value={config.textColor}
                    tokens={textTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('textColor', v)}
                />

                <TokenSelect
                    label="Border Color"
                    value={config.borderColor}
                    tokens={strokeTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('borderColor', v)}
                />

                <TokenSelect
                    label="Border Radius"
                    value={config.borderRadius}
                    tokens={radiusTokens}
                    tokenMap={tokenMap}
                    onChange={(v) => updateConfig('borderRadius', v)}
                />

                {/* Padding X and Y in one row */}
                <div className="ftd-playground-control-row">
                    <TokenSelect
                        label="Padding X"
                        value={config.paddingX}
                        tokens={spacingTokens}
                        tokenMap={tokenMap}
                        onChange={(v) => updateConfig('paddingX', v)}
                    />
                    <TokenSelect
                        label="Padding Y"
                        value={config.paddingY}
                        tokens={spacingTokens}
                        tokenMap={tokenMap}
                        onChange={(v) => updateConfig('paddingY', v)}
                    />
                </div>

                <TokenSelect
                    label="Font Size"
                    value={config.fontSize}
                    tokens={fontSizeTokens}
                    tokenMap={tokenMap}
                    onChange={(v) => updateConfig('fontSize', v)}
                />

                <TokenSelect
                    label="Line Height"
                    value={config.lineHeight}
                    tokens={lineHeightTokens}
                    tokenMap={tokenMap}
                    onChange={(v) => updateConfig('lineHeight', v)}
                />

                <div className="ftd-playground-section-header" style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: 'var(--ftd-text-main)' }}>
                    Hover State
                </div>

                <TokenSelect
                    label="Hover Background"
                    value={config.hoverBackgroundColor}
                    tokens={fillTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('hoverBackgroundColor', v)}
                />

                <TokenSelect
                    label="Hover Text Color"
                    value={config.hoverTextColor}
                    tokens={textTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('hoverTextColor', v)}
                />

                <TokenSelect
                    label="Hover Border Color"
                    value={config.hoverBorderColor}
                    tokens={strokeTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('hoverBorderColor', v)}
                />

                <div className="ftd-playground-section-header" style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, color: 'var(--ftd-text-main)' }}>
                    Active State
                </div>

                <TokenSelect
                    label="Active Background"
                    value={config.activeBackgroundColor}
                    tokens={fillTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('activeBackgroundColor', v)}
                />

                <TokenSelect
                    label="Active Text Color"
                    value={config.activeTextColor}
                    tokens={textTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('activeTextColor', v)}
                />

                <TokenSelect
                    label="Active Border Color"
                    value={config.activeBorderColor}
                    tokens={strokeTokens}
                    tokenMap={tokenMap}
                    type="color"
                    onChange={(v) => updateConfig('activeBorderColor', v)}
                />

                <div className="ftd-playground-actions">
                    <button
                        type="button"
                        onClick={onReset}
                        className="ftd-playground-reset-btn"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        Reset to Defaults
                    </button>
                </div>
            </div>

            <div className="ftd-playground-preview-area">
                <div className="ftd-playground-canvas">
                    <button
                        style={{
                            backgroundColor: getPreviewValue(
                                isActive && config.activeBackgroundColor ? config.activeBackgroundColor :
                                    isHovered && config.hoverBackgroundColor ? config.hoverBackgroundColor :
                                        config.backgroundColor,
                                '#3b82f6'
                            ),
                            color: getPreviewValue(
                                isActive && config.activeTextColor ? config.activeTextColor :
                                    isHovered && config.hoverTextColor ? config.hoverTextColor :
                                        config.textColor,
                                '#ffffff'
                            ),
                            borderColor: getPreviewValue(
                                isActive && config.activeBorderColor ? config.activeBorderColor :
                                    isHovered && config.hoverBorderColor ? config.hoverBorderColor :
                                        config.borderColor,
                                'transparent'
                            ),
                            borderWidth: '1px',
                            borderStyle: config.borderColor === 'transparent' ? 'none' : 'solid',
                            borderRadius: getPreviewValue(config.borderRadius, '8px'),
                            padding: `${getPreviewValue(config.paddingY, '12px')} ${getPreviewValue(config.paddingX, '24px')}`,
                            fontSize: getPreviewValue(config.fontSize, '16px'),
                            lineHeight: getPreviewValue(config.lineHeight, 'normal'),
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease',
                            width: config.isFullWidth ? '100%' : 'auto',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onMouseDown={() => setIsActive(true)}
                        onMouseUp={() => setIsActive(false)}
                    >
                        {config.showIcon && (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginRight: '8px' }}
                            >
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                        {config.buttonText || 'Button Preview'}
                    </button>
                </div>

                <div className="ftd-playground-code">
                    <div className="ftd-code-header">
                        <div className="ftd-playground-tabs">
                            <button
                                type="button"
                                className={`ftd-playground-tab-btn ${activeTab === 'css' ? 'active' : ''}`}
                                onClick={() => setActiveTab('css')}
                            >
                                CSS
                            </button>
                            <button
                                type="button"
                                className={`ftd-playground-tab-btn ${activeTab === 'scss' ? 'active' : ''}`}
                                onClick={() => setActiveTab('scss')}
                            >
                                SCSS
                            </button>
                            <button
                                type="button"
                                className={`ftd-playground-tab-btn ${activeTab === 'tailwind' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tailwind')}
                            >
                                Tailwind
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="ftd-playground-copy-btn"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <pre>
                        <code>{codeSnippet}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
