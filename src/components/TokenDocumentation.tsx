'use client';

import React, { useState, useMemo } from 'react';
import type { TokenDocumentationProps } from '../types';
import { ColorGrid } from './ColorGrid';
import { SpacingScale } from './SpacingScale';
import { RadiusShowcase } from './RadiusShowcase';
import { SizeScale } from './SizeScale';

type TabType = string;

interface TokenData {
    value: string;
    type: string;
}

interface VariantTokens {
    [key: string]: TokenData;
}

interface DimensionGroup {
    [size: string]: TokenData;
}

interface ComponentData {
    variants: Record<string, VariantTokens>;
    dimensions: Record<string, DimensionGroup>;
}

/**
 * TokenDocumentation - Production-ready Design System Documentation
 */
export function TokenDocumentation({
    tokens,
    title = 'Design Tokens',
    subtitle = 'Interactive documentation for your design system',
    defaultTab = 'colors',
    showSearch = true,
    darkMode: initialDarkMode = false,
    onTokenClick,
}: TokenDocumentationProps) {
    const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    // --- Token Resolution Logic ---
    const resolveTokenValue = useMemo(() => {
        const tokenMap: Record<string, string> = {};

        const buildTokenMap = (obj: any, prefix: string = '') => {
            if (!obj || typeof obj !== 'object') return;
            Object.entries(obj).forEach(([key, value]: [string, any]) => {
                const path = prefix ? `${prefix}.${key}` : key;
                if (value && typeof value === 'object') {
                    if (value.hasOwnProperty('value') && value.hasOwnProperty('type')) {
                        tokenMap[path] = value.value;
                    } else {
                        buildTokenMap(value, path);
                    }
                }
            });
        };

        Object.entries(tokens).forEach(([setKey, setData]) => {
            if (['global', '$themes', '$metadata'].includes(setKey)) return;
            buildTokenMap(setData, '');
        });

        return (value: string, maxDepth: number = 10): string => {
            if (!value || typeof value !== 'string') return value;
            let currentValue = value;
            let depth = 0;
            while (currentValue.startsWith('{') && currentValue.endsWith('}') && depth < maxDepth) {
                const refPath = currentValue.slice(1, -1);
                const resolved = tokenMap[refPath];
                if (resolved !== undefined) {
                    currentValue = resolved;
                } else {
                    let found = false;
                    for (const [key, val] of Object.entries(tokenMap)) {
                        if (key.endsWith(refPath) || key.endsWith('.' + refPath)) {
                            currentValue = val;
                            found = true;
                            break;
                        }
                    }
                    if (!found) break;
                }
                depth++;
            }
            return currentValue;
        };
    }, [tokens]);

    // --- Helpers ---
    const isSingleToken = (obj: any): boolean =>
        obj && typeof obj === 'object' && obj.hasOwnProperty('value') && obj.hasOwnProperty('type');

    const isDimensionGroup = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object') return false;
        const values = Object.values(obj);
        return values.length > 0 && values.every((v: any) => isSingleToken(v) && v.type === 'dimension');
    };

    const isColorVariant = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object' || isSingleToken(obj) || isDimensionGroup(obj)) return false;
        return Object.entries(obj).some(([key, value]: [string, any]) => {
            if (!isSingleToken(value) || value.type !== 'color') return false;
            const lowerKey = key.toLowerCase();
            return ['fill', 'stroke', 'text', 'bg', 'border', 'foreground'].some(k => lowerKey.includes(k));
        });
    };

    // --- Data Processing ---
    const tokenSets = Object.entries(tokens)
        .filter(([key]) => !['global', '$themes', '$metadata'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const detectTokenSetType = (tokenSet: any): string => {
        if (!tokenSet || typeof tokenSet !== 'object') return 'other';
        if (tokenSet.base || tokenSet.fill || tokenSet.stroke || tokenSet.text) return 'colors';

        const rootValues = Object.values(tokenSet);
        const allRootTokens = rootValues.every((v: any) => isSingleToken(v));

        if (allRootTokens) {
            const allDimensions = rootValues.every((v: any) => v.type === 'dimension');
            if (allDimensions) {
                const name = Object.keys(tokenSet).join(' ').toLowerCase();
                if (name.includes('space') || name.includes('spacing')) return 'spacing';
                if (name.includes('radius') || name.includes('border')) return 'radius';
                if (['size', 'width', 'height'].some(n => name.includes(n))) return 'sizes';
                return 'dimensions';
            }
        }
        if (rootValues.some((v: any) => v && typeof v === 'object' && !isSingleToken(v))) return 'components';
        return 'other';
    };

    const categorizedSets = Object.entries(tokenSets).reduce((acc, [key, value]) => {
        const type = detectTokenSetType(value);
        if (!acc[type]) acc[type] = {};
        acc[type][key] = value;
        return acc;
    }, {} as Record<string, Record<string, any>>);

    const mergedComponents = useMemo(() => {
        const components: Record<string, ComponentData> = {};
        Object.entries(categorizedSets.components || {}).forEach(([_, setData]) => {
            Object.entries(setData as any).forEach(([compName, content]) => {
                if (!content || typeof content !== 'object' || isSingleToken(content)) return;
                if (!components[compName]) components[compName] = { variants: {}, dimensions: {} };

                Object.entries(content as any).forEach(([itemKey, itemValue]) => {
                    if (isColorVariant(itemValue)) components[compName].variants[itemKey] = itemValue as VariantTokens;
                    else if (isDimensionGroup(itemValue)) components[compName].dimensions[itemKey] = itemValue as DimensionGroup;
                });
            });
        });
        return components;
    }, [categorizedSets]);

    const availableTabs = useMemo(() => {
        const tabs = [];
        const config: Record<string, any> = {
            colors: { label: 'Colors', icon: '🎨' },
            spacing: { label: 'Spacing', icon: '📏' },
            sizes: { label: 'Sizes', icon: '📐' },
            radius: { label: 'Radius', icon: '⬜' }
        };

        Object.keys(config).forEach(type => {
            if (categorizedSets[type] && Object.keys(categorizedSets[type]).length > 0) {
                tabs.push({ id: type, ...config[type] });
            }
        });

        if (Object.values(mergedComponents).some(c => Object.keys(c.variants).length > 0)) {
            tabs.push({ id: 'components', label: 'Components', icon: '🧩' });
        }
        return tabs;
    }, [categorizedSets, mergedComponents]);

    const validActiveTab = availableTabs.some(t => t.id === activeTab) ? activeTab : (availableTabs[0]?.id || 'colors');

    // --- Interaction ---
    const handleCopy = (value: string, label: string) => {
        navigator.clipboard.writeText(value);
        setCopiedToken(label);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const getResolvedColor = (variantTokens: VariantTokens, patterns: string[], exclude: string[] = []) => {
        for (const pattern of patterns) {
            const entry = Object.entries(variantTokens).find(([key]) => {
                const k = key.toLowerCase();
                return (k === pattern || k.includes(pattern)) && !exclude.some(e => k.includes(e));
            });
            if (entry) return { name: entry[0], reference: entry[1].value, resolved: resolveTokenValue(entry[1].value) };
        }
        return null;
    };

    // --- Sub-Components ---

    // A compact swatch for the table
    const TableSwatch = ({ data }: { data: { reference: string; resolved: string } | null }) => {
        if (!data) return <span className="ftd-cell-empty">-</span>;

        return (
            <div className="ftd-table-swatch-container" onClick={() => handleCopy(data.resolved, data.reference)}>
                <div className="ftd-table-swatch" style={{ backgroundColor: data.resolved }} />
                <div className="ftd-table-value-group">
                    <code className="ftd-table-hex">{data.resolved}</code>
                    <span className="ftd-table-ref" title={data.reference}>
                        {data.reference.split('.').pop()}
                    </span>
                </div>
            </div>
        );
    };

    const VariantCard = ({
        variantName,
        variantTokens,
        dimensionGroups
    }: {
        variantName: string;
        variantTokens: VariantTokens;
        dimensionGroups: Record<string, DimensionGroup>;
    }) => {
        // Resolve Colors
        const states = ['default', 'hover', 'disabled'];
        const properties = ['fill', 'stroke', 'text'];

        const getColorForState = (prop: string, state: string) => {
            const exclude = states.filter(s => s !== state && s !== 'default');
            const search = state === 'default' ? [prop] : [`${prop}-${state}`, `${prop}${state}`];
            return getResolvedColor(variantTokens, search, exclude);
        };

        // Preview Styles
        const fill = getColorForState('fill', 'default')?.resolved || '#6366f1';
        const stroke = getColorForState('stroke', 'default')?.resolved || 'transparent';
        const text = getColorForState('text', 'default')?.resolved || '#ffffff';
        const radius = dimensionGroups['radius']?.md?.value || '6px';

        return (
            <div className="ftd-variant-card">
                <div className="ftd-variant-header">
                    <span className="ftd-variant-name">{variantName}</span>
                </div>

                <div className="ftd-variant-body">
                    {/* Preview */}
                    <div className="ftd-variant-preview">
                        <button
                            className="ftd-variant-button"
                            style={{
                                backgroundColor: fill,
                                color: text,
                                border: `1.5px solid ${stroke === 'transparent' ? fill : stroke}`,
                                borderRadius: radius,
                            }}
                        >
                            {variantName.charAt(0).toUpperCase() + variantName.slice(1)}
                        </button>
                    </div>

                    {/* Spec Table */}
                    <div className="ftd-variant-table-wrapper">
                        <table className="ftd-variant-table">
                            <thead>
                                <tr>
                                    <th>State</th>
                                    <th>Fill</th>
                                    <th>Border</th>
                                    <th>Text</th>
                                </tr>
                            </thead>
                            <tbody>
                                {states.map(state => {
                                    const fillData = getColorForState('fill', state);
                                    const strokeData = getColorForState('stroke', state) || getColorForState('border', state);
                                    const textData = getColorForState('text', state) || getColorForState('color', state);

                                    // Only show row if at least one property exists for this state (except default, always show)
                                    if (state !== 'default' && !fillData && !strokeData && !textData) return null;

                                    return (
                                        <tr key={state}>
                                            <td className="ftd-cell-label">{state}</td>
                                            <td><TableSwatch data={fillData} /></td>
                                            <td><TableSwatch data={strokeData} /></td>
                                            <td><TableSwatch data={textData} /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="ftd-container" data-theme={isDarkMode ? 'dark' : 'light'}>
            {copiedToken && <div className="ftd-copied-toast">Copied to clipboard</div>}

            <div className="ftd-navbar-sticky">
                <header className="ftd-header">
                    <div className="ftd-title-wrapper">
                        <h1 className="ftd-title">{title}</h1>
                        <p className="ftd-subtitle">{subtitle}</p>
                    </div>
                    <button className="ftd-theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                    </button>
                </header>

                {/* Navigation Tabs */}
                {availableTabs.length > 1 && (
                    <nav className="ftd-tabs">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`ftd-tab ${validActiveTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                )}
            </div>

            <div className="ftd-content">
                {validActiveTab === 'colors' && categorizedSets.colors && (() => {
                    const colorData = Object.values(categorizedSets.colors)[0] as any;
                    return (
                        <ColorGrid
                            baseColors={colorData?.base}
                            fillColors={colorData?.fill}
                            strokeColors={colorData?.stroke}
                            textColors={colorData?.text}
                            onColorClick={onTokenClick}
                        />
                    );
                })()}

                {validActiveTab === 'spacing' && <SpacingScale tokens={Object.values(categorizedSets.spacing || {})[0] || {}} onTokenClick={onTokenClick} />}
                {validActiveTab === 'sizes' && <SizeScale tokens={Object.values(categorizedSets.sizes || {})[0] || {}} onTokenClick={onTokenClick} />}
                {validActiveTab === 'radius' && <RadiusShowcase tokens={Object.values(categorizedSets.radius || {})[0] || {}} onTokenClick={onTokenClick} />}

                {/* Components Tab - Refined */}
                {validActiveTab === 'components' && (
                    <div className="ftd-components-showcase">
                        {Object.entries(mergedComponents).map(([name, data]) => {
                            // STRICT FILTER: Only Primary, Secondary, Tertiary
                            const allowed = ['primary', 'secondary', 'tertiary'];
                            const variants = Object.keys(data.variants)
                                .filter(k => allowed.includes(k.toLowerCase()))
                                .sort((a, b) => allowed.indexOf(a.toLowerCase()) - allowed.indexOf(b.toLowerCase()));

                            if (variants.length === 0) return null;

                            return (
                                <div key={name} className="ftd-component-section">
                                    <div className="ftd-section-header">
                                        <h3 className="ftd-section-title">{name}</h3>
                                        <span className="ftd-section-badge">{variants.length} Variants</span>
                                    </div>

                                    <div className="ftd-variants-grid">
                                        {variants.map(v => (
                                            <VariantCard
                                                key={v}
                                                variantName={v}
                                                variantTokens={data.variants[v]}
                                                dimensionGroups={data.dimensions}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TokenDocumentation;