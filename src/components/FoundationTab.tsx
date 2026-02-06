'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { NestedTokens } from '../types';
import { SpacingScale } from './SpacingScale';
import { SizeScale } from './SizeScale';
import { RadiusShowcase } from './RadiusShowcase';
import { getContrastColor, copyToClipboard } from '../utils';

interface FoundationTabProps {
    tokens: NestedTokens;
    tokenMap: Record<string, string>;
    onTokenClick?: (token: any) => void;
}

interface Section {
    id: string;
    name: string;
    icon: string;
    type: string;
    tokens: any;
    count: number;
}

/**
 * FoundationTab - Displays all foundation tokens with scroll-spy navigation
 */
export function FoundationTab({ tokens, tokenMap, onTokenClick }: FoundationTabProps) {
    const observer = useRef<IntersectionObserver | null>(null);
    const [activeSection, setActiveSection] = useState<string>('');

    const sections = useMemo(() => {
        const items: Section[] = [];
        const allColors: any = {};

        Object.entries(tokens).forEach(([groupName, groupTokens]) => {
            if (!groupTokens || typeof groupTokens !== 'object') return;

            const groupKey = groupName.toLowerCase();
            const firstToken = Object.values(groupTokens)[0] as any;
            const tokenType = firstToken?.type || 'other';

            const count = Object.keys(groupTokens).filter(key => {
                const val = (groupTokens as any)[key];
                return val && typeof val === 'object';
            }).length;

            if (tokenType === 'color') {
                allColors[groupName] = groupTokens;
            } else if (groupKey === 'space' || groupKey === 'spacing') {
                items.push({ id: 'spacing-section', name: 'Spacing', icon: '📏', type: 'spacing', tokens: groupTokens, count });
            } else if (groupKey === 'size' || groupKey === 'sizing') {
                items.push({ id: 'sizes-section', name: 'Sizes', icon: '📐', type: 'sizing', tokens: groupTokens, count });
            } else if (groupKey === 'radius') {
                items.push({ id: 'radius-section', name: 'Radius', icon: '⬜', type: 'radius', tokens: groupTokens, count });
            } else if (groupKey.includes('font') || groupKey.includes('line')) {
                items.push({
                    id: `typo-${groupKey}`,
                    name: groupName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    icon: '🔤',
                    type: 'typography',
                    tokens: groupTokens,
                    count
                });
            }
        });

        if (Object.keys(allColors).length > 0) {
            items.unshift({ id: 'colors-section', name: 'Colors', icon: '🎨', type: 'colors', tokens: allColors, count: Object.keys(allColors).length });
        }

        return items;
    }, [tokens]);

    // Initialize active section
    useEffect(() => {
        if (sections.length > 0 && !activeSection) {
            setActiveSection(sections[0].id);
        }
    }, [sections, activeSection]);

    // Scroll Spy
    useEffect(() => {
        const options = { rootMargin: '-100px 0px -50% 0px', threshold: 0 };
        observer.current = new IntersectionObserver((entries) => {
            const intersecting = entries.find(entry => entry.isIntersecting);
            if (intersecting) {
                setActiveSection(intersecting.target.id);
            }
        }, options);

        const sectionElements = document.querySelectorAll('.ftd-foundation-section');
        sectionElements.forEach((el) => observer.current?.observe(el));

        return () => observer.current?.disconnect();
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    if (sections.length === 0) {
        return <div className="ftd-empty">No foundation tokens found</div>;
    }

    return (
        <div className="ftd-color-layout">
            <aside className="ftd-color-sidebar">
                <nav className="ftd-color-nav">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`ftd-color-nav-link ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(section.id)}
                        >
                            <span className="ftd-nav-icon">{section.icon}</span>
                            <span className="ftd-nav-label">{section.name}</span>
                            <span className="ftd-nav-count">{section.count}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="ftd-color-content">
                {sections.map((section) => (
                    <div key={section.id} id={section.id} className="ftd-foundation-section">
                        {section.type === 'colors' && (
                            <div className="ftd-section">
                                <div className="ftd-section-header">
                                    <div className="ftd-section-icon">🎨</div>
                                    <h2 className="ftd-section-title">Base Colors</h2>
                                    <span className="ftd-section-count">{Object.keys(section.tokens).length} families</span>
                                </div>
                                <ColorFamiliesDisplay
                                    colorFamilies={section.tokens}
                                    tokenMap={tokenMap}
                                    onTokenClick={onTokenClick}
                                />
                            </div>
                        )}

                        {section.type === 'spacing' && (
                            <SpacingScale tokens={section.tokens} onTokenClick={onTokenClick} />
                        )}

                        {section.type === 'sizing' && (
                            <SizeScale tokens={section.tokens} onTokenClick={onTokenClick} />
                        )}

                        {section.type === 'radius' && (
                            <RadiusShowcase tokens={section.tokens} onTokenClick={onTokenClick} />
                        )}

                        {section.type === 'typography' && (
                            <div className="ftd-section">
                                <div className="ftd-section-header">
                                    <div className="ftd-section-icon">🔤</div>
                                    <h2 className="ftd-section-title">{section.name}</h2>
                                    <span className="ftd-section-count">{section.count} tokens</span>
                                </div>
                                <TypographyDisplay tokens={section.tokens} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TypographyDisplay({ tokens }: { tokens: NestedTokens }) {
    const entries = Object.entries(tokens).filter(([_, value]) =>
        value && typeof value === 'object' && 'value' in value && 'type' in value
    );

    if (entries.length === 0) return null;

    return (
        <div className="ftd-typography-grid">
            {entries.map(([name, token]: [string, any]) => (
                <div key={name} className="ftd-typography-card" data-token-name={name}>
                    <div className="ftd-typography-label">{name}</div>
                    <div className="ftd-typography-value">{token.value}</div>
                </div>
            ))}
        </div>
    );
}

function ColorFamiliesDisplay({
    colorFamilies,
    tokenMap,
    onTokenClick
}: {
    colorFamilies: any;
    tokenMap: Record<string, string>;
    onTokenClick?: (token: any) => void;
}) {
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const showToast = (value: string) => {
        setCopiedValue(value);
        setTimeout(() => setCopiedValue(null), 2000);
    };

    const handleCopy = async (colorValue: string, cssVar: string) => {
        const fullCssVar = `var(${cssVar})`;
        const success = await copyToClipboard(fullCssVar);
        if (success) showToast(fullCssVar);
        onTokenClick?.({ value: colorValue, cssVariable: cssVar });
    };

    return (
        <div className="ftd-color-family-container">
            {Object.entries(colorFamilies).map(([familyName, shades]: [string, any]) => {
                const shadeKeys = Object.keys(shades);
                const midShade = shades[shadeKeys[Math.floor(shadeKeys.length / 2)]];
                const familyColor = midShade?.value || '#000';

                return (
                    <div key={familyName} className="ftd-color-family">
                        <div className="ftd-color-family-header">
                            <div className="ftd-color-family-swatch" style={{ backgroundColor: familyColor }} />
                            <h3 className="ftd-color-family-name">{familyName}</h3>
                        </div>

                        <div className="ftd-color-scale">
                            {Object.entries(shades).map(([shadeName, shadeToken]: [string, any]) => {
                                const bgColor = shadeToken.value;
                                const textColor = getContrastColor(bgColor);
                                const cssVar = `--base-${familyName}-${shadeName}`;
                                const tokenFullName = `${familyName}-${shadeName}`;

                                return (
                                    <div
                                        key={shadeName}
                                        className="ftd-color-shade"
                                        data-token-name={tokenFullName}
                                        style={{ backgroundColor: bgColor, color: textColor }}
                                        onClick={() => handleCopy(bgColor, cssVar)}
                                    >
                                        <span className="ftd-color-shade-label">{shadeName}</span>
                                        <div className="ftd-shade-values">
                                            <code className="ftd-shade-css-var">{cssVar}</code>
                                            <code className="ftd-shade-hex">{bgColor}</code>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {copiedValue && (
                <div className="ftd-copied-toast">
                    <div className="ftd-toast-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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

export default FoundationTab;
