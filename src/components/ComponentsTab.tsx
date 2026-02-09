'use client';

import React, { useState } from 'react';
import { Icon, type IconName } from './Icon';
import { toCssVariable, resolveTokenValue } from '../utils/core';

interface ComponentsTabProps {
    components: Record<string, ComponentData>;
    tokenMap: Record<string, string>;
    onCopy: (value: string, label: string) => void;
}

interface ComponentData {
    variants: Record<string, any>;
    dimensions: Record<string, any>;
}

interface Section {
    id: string;
    name: string;
    icon: IconName;
    data: ComponentData;
}

/**
 * ComponentsTab - Displays component tokens with sidebar navigation
 */
export function ComponentsTab({ components, tokenMap, onCopy }: ComponentsTabProps) {
    // Build sections from components
    const sections: Section[] = Object.entries(components)
        .filter(([_, data]) => {
            const hasVariants = Object.keys(data.variants).length > 0;
            const hasDimensions = Object.keys(data.dimensions).length > 0;
            return hasVariants || hasDimensions;
        })
        .map(([name, data]) => ({
            id: name.toLowerCase(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            icon: getComponentIcon(name),
            data
        }));

    const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

    const activeData = sections.find(s => s.id === activeSection);

    if (sections.length === 0) {
        return (
            <div className="ftd-empty">
                <div className="ftd-empty-icon"><Icon name="components" /></div>
                <h3 className="ftd-empty-title">No component tokens found</h3>
                <p className="ftd-empty-text">Add component tokens to your tokens.json file</p>
            </div>
        );
    }

    return (
        <div className="ftd-color-layout">
            {/* Sidebar Navigation */}
            <div className="ftd-color-sidebar">
                <nav className="ftd-color-nav">
                    {sections.map((section) => {
                        const variantCount = Object.keys(section.data.variants).length;
                        const dimensionCount = Object.keys(section.data.dimensions).length;
                        const count = variantCount > 0 ? variantCount : dimensionCount;

                        return (
                            <button
                                key={section.id}
                                className={`ftd-color-nav-link ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <span className="ftd-nav-icon"><Icon name={section.icon} /></span>
                            <span className="ftd-nav-label">{section.name}</span>
                            <span className="ftd-nav-count">{count}</span>
                        </button>
                    );
                })}
            </nav>
            </div>

            {/* Content Area */}
            <div className="ftd-color-content">
                {activeData && (
                    <div id={activeData.id} className="ftd-color-section">
                        <ComponentDisplay
                            name={activeData.name}
                            componentId={activeData.id}
                            data={activeData.data}
                            tokenMap={tokenMap}
                            onCopy={onCopy}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function getCssVarFromValue(value: string): string | null {
    if (!value || typeof value !== 'string') return null;
    if (value.startsWith('{') && value.endsWith('}')) {
        const refPath = value.slice(1, -1);
        return toCssVariable(refPath);
    }
    return null;
}

function getResolvedValue(value: string, tokenMap: Record<string, string>): string {
    if (!value || typeof value !== 'string') return value as any;
    // Resolve aliases to raw values (e.g. px)
    const resolved = resolveTokenValue(value, tokenMap);
    return resolved || value;
}

const SIZE_ORDER = [
    '2xs', 'xs', 'sm', 'md', 'lg', 'xl',
    '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl',
];
const SIZE_INDEX = new Map(SIZE_ORDER.map((key, index) => [key, index]));

function sortDimensionEntries(entries: Array<[string, any]>): Array<[string, any]> {
    return [...entries].sort(([a], [b]) => {
        const aKey = a.toLowerCase();
        const bKey = b.toLowerCase();
        const aIdx = SIZE_INDEX.get(aKey);
        const bIdx = SIZE_INDEX.get(bKey);

        if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
        if (aIdx !== undefined) return -1;
        if (bIdx !== undefined) return 1;

        const aNum = Number.parseFloat(aKey.replace(/[^0-9.]/g, ''));
        const bNum = Number.parseFloat(bKey.replace(/[^0-9.]/g, ''));
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;

        return aKey.localeCompare(bKey);
    });
}

/**
 * Display a single component with its variants and/or dimensions
 */
function ComponentDisplay({
    name,
    componentId,
    data,
    tokenMap,
    onCopy
}: {
    name: string;
    componentId: string;
    data: ComponentData;
    tokenMap: Record<string, string>;
    onCopy: (value: string, label: string) => void;
}) {
    const variants = Object.keys(data.variants);
    const dimensions = Object.keys(data.dimensions);

    const renderDimensionPreview = (groupName: string, previewValue: string) => {
        const group = groupName.toLowerCase();
        if (group.includes('font') || group.includes('size')) {
            return (
                <div style={{ fontSize: previewValue, fontWeight: 600, color: 'var(--ftd-primary)', lineHeight: 1 }}>
                    Aa
                </div>
            );
        }
        if (group.includes('line')) {
            return (
                <div
                    style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        lineHeight: previewValue,
                        color: 'var(--ftd-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0px',
                        maxHeight: '48px',
                        overflow: 'hidden',
                    }}
                >
                    <div>Aa</div>
                    <div>Aa</div>
                </div>
            );
        }
        if (group.includes('radius')) {
            return (
                <div
                    className="ftd-token-preview"
                    style={{ width: '36px', height: '36px', borderRadius: previewValue }}
                />
            );
        }
        if (group.includes('height')) {
            return (
                <div
                    style={{
                        width: '14px',
                        height: previewValue,
                        borderRadius: '6px',
                        background: 'var(--ftd-primary)',
                        boxShadow: '0 4px 12px rgba(var(--ftd-primary-rgb), 0.25)',
                    }}
                />
            );
        }
        if (group.includes('padding')) {
            return (
                <div
                    style={{
                        padding: previewValue,
                        borderRadius: '8px',
                        background: 'rgba(var(--ftd-primary-rgb), 0.08)',
                        border: '1px solid rgba(var(--ftd-primary-rgb), 0.18)',
                    }}
                >
                    <div style={{ width: '14px', height: '14px', background: 'var(--ftd-primary)', borderRadius: '4px' }} />
                </div>
            );
        }

        return <div className="ftd-token-preview" style={{ width: '20px', height: '20px', borderRadius: '6px' }} />;
    };

    return (
        <div className="ftd-section">
            <div className="ftd-section-header">
                <div className="ftd-section-icon"><Icon name="components" /></div>
                <h2 className="ftd-section-title">{name}</h2>
                {variants.length > 0 && (
                    <span className="ftd-section-badge">{variants.length} Variants</span>
                )}
                {dimensions.length > 0 && (
                    <span className="ftd-section-badge">{dimensions.length} Dimensions</span>
                )}
            </div>

            {/* Display dimensions */}
            {dimensions.length > 0 && (
                <div className="ftd-dimensions-display">
                    {Object.entries(data.dimensions).map(([dimName, dimGroup]) => (
                        <div key={dimName} className="ftd-dimension-group">
                            <h3 className="ftd-dimension-title">{dimName}</h3>
                            <div className="ftd-token-grid">
                                {sortDimensionEntries(Object.entries(dimGroup as any)).map(([sizeName, sizeToken]: [string, any]) => {
                                    const rawValue = sizeToken.value;
                                    const cssVar = getCssVarFromValue(rawValue);
                                    const resolvedValue = getResolvedValue(rawValue, tokenMap);
                                    const copyValue = cssVar ? `var(${cssVar})` : rawValue;
                                    const cssVarText = cssVar || '--';
                                    const tokenName = `${componentId} ${dimName} ${sizeName}`;
                                    const componentCssVar = `--${componentId}-${dimName}-${sizeName}`;
                                    return (
                                        <div
                                            key={sizeName}
                                            className="ftd-display-card ftd-clickable-card"
                                            data-token-name={tokenName}
                                            data-token-css-var={componentCssVar}
                                            onClick={() => onCopy(copyValue, cssVar || sizeName)}
                                            title={`Click to copy: ${copyValue}`}
                                        >
                                            <div className="ftd-token-preview-container">
                                                {renderDimensionPreview(dimName, resolvedValue)}
                                            </div>
                                            <p className="ftd-token-card-label">{sizeName}</p>
                                            <div className="ftd-token-values-row">
                                                <span className="ftd-token-css-var">{cssVarText}</span>
                                                <span className="ftd-token-hex">{resolvedValue}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Display variants (if any) */}
            {variants.length > 0 && (
                <div className="ftd-variants-section">
                    <h4 className="ftd-variants-title">Variants</h4>
                    <div className="ftd-variants-grid">
                        {variants.map(variantName => (
                            <div key={variantName} className="ftd-variant-card">
                                <h5 className="ftd-variant-name">{variantName}</h5>
                                {/* Add variant display logic here if needed */}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Get icon for component type
 */
function getComponentIcon(componentName: string): IconName {
    const iconMap: Record<string, IconName> = {
        button: 'button',
        input: 'input',
        card: 'card',
        modal: 'modal',
        dropdown: 'dropdown',
        checkbox: 'checkbox',
        radio: 'radio',
        toggle: 'toggle',
        slider: 'slider',
        badge: 'badge',
        alert: 'alert',
        tooltip: 'tooltip',
        avatar: 'avatar',
        default: 'components'
    };

    const key = componentName.toLowerCase();
    return iconMap[key] || iconMap.default;
}

export default ComponentsTab;
