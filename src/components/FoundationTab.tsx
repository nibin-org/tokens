'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { NestedTokens } from '../types';
import { SpacingDisplay } from './SpacingDisplay';
import { SizeDisplay } from './SizeDisplay';
import { RadiusDisplay } from './RadiusDisplay';
import { getContrastColor } from '../utils/color';
import { copyToClipboard } from '../utils/ui';
import { findAllTokens, toCssVariable } from '../utils/core';
import { Icon, type IconName } from './Icon';

interface FoundationTabProps {
    tokens: NestedTokens;
    tokenMap: Record<string, string>;
    onTokenClick?: (token: any) => void;
}

interface Section {
    id: string;
    name: string;
    icon: IconName;
    type: string;
    tokens: any;
    count: number;
}

type FoundationTokenKind = 'color' | 'spacing' | 'sizing' | 'radius' | 'typography' | 'other';

function isTokenObject(value: unknown): value is { value: string | number; type: string } {
    return !!value && typeof value === 'object' && 'value' in (value as Record<string, unknown>) && 'type' in (value as Record<string, unknown>);
}

function inferKindFromPath(path: string[]): FoundationTokenKind {
    const joined = path.join('-').toLowerCase();

    if (joined.includes('radius') || joined.includes('round')) return 'radius';
    if (joined.includes('space') || joined.includes('spacing') || joined.includes('gap') || joined.includes('padding') || joined.includes('margin')) return 'spacing';
    if (joined.includes('font') || joined.includes('line-height') || joined.includes('lineheight') || joined.includes('letter')) return 'typography';
    if (joined.includes('size') || joined.includes('width') || joined.includes('height')) return 'sizing';

    return 'other';
}

function normalizeTokenKind(type: string, path: string[]): FoundationTokenKind {
    const raw = String(type || '').toLowerCase();

    if (raw === 'color') return 'color';
    if (raw === 'spacing') return 'spacing';
    if (raw === 'sizing' || raw === 'size') return 'sizing';
    if (raw === 'borderradius' || raw === 'radius') return 'radius';
    if (raw.includes('font') || raw.includes('line') || raw.includes('letter')) return 'typography';

    if (raw === 'dimension') return inferKindFromPath(path);

    const inferred = inferKindFromPath(path);
    return inferred === 'other' ? 'other' : inferred;
}

function normalizePathForKind(path: string[]): string[] {
    const genericWrappers = new Set(['foundation', 'value', 'base', 'token', 'tokens', 'primitive', 'primitives']);

    let start = 0;
    while (start < path.length - 1) {
        const part = path[start].toLowerCase();
        if (genericWrappers.has(part)) {
            start += 1;
            continue;
        }
        break;
    }

    return path.slice(start);
}

function addTokenAtPath(target: Record<string, any>, path: string[], token: { value: string | number; type: string }) {
    if (path.length === 0) return;

    let cursor: Record<string, any> = target;
    for (let i = 0; i < path.length - 1; i += 1) {
        const segment = path[i];
        if (!cursor[segment] || typeof cursor[segment] !== 'object' || isTokenObject(cursor[segment])) {
            cursor[segment] = {};
        }
        cursor = cursor[segment] as Record<string, any>;
    }

    cursor[path[path.length - 1]] = token;
}

function collectTypedTrees(tokens: NestedTokens) {
    const colorTree: Record<string, any> = {};
    const spacingTree: Record<string, any> = {};
    const sizingTree: Record<string, any> = {};
    const radiusTree: Record<string, any> = {};
    const typographyTree: Record<string, any> = {};

    const walk = (node: unknown, path: string[]) => {
        if (!node || typeof node !== 'object') return;

        if (isTokenObject(node)) {
            const kind = normalizeTokenKind(node.type, path);
            const normalizedPath = normalizePathForKind(path);
            if (kind === 'color') addTokenAtPath(colorTree, normalizedPath, node);
            if (kind === 'spacing') addTokenAtPath(spacingTree, normalizedPath, node);
            if (kind === 'sizing') addTokenAtPath(sizingTree, normalizedPath, node);
            if (kind === 'radius') addTokenAtPath(radiusTree, normalizedPath, node);
            if (kind === 'typography') addTokenAtPath(typographyTree, normalizedPath, node);
            return;
        }

        Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
            walk(value, [...path, key]);
        });
    };

    walk(tokens, []);
    return { colorTree, spacingTree, sizingTree, radiusTree, typographyTree };
}

function normalizeColorFamilyName(path: string[]) {
    const wrappers = new Set(['color', 'colors', 'base', 'foundation', 'value', 'primitive', 'primitives', 'palette', 'palettes']);
    const filtered = path.filter(p => !wrappers.has(p.toLowerCase()));
    const finalParts = filtered.length > 0 ? filtered : path;
    return finalParts.join('-') || 'base';
}

function flattenColorFamilies(node: unknown, path: string[] = [], families: Record<string, any> = {}) {
    if (!node || typeof node !== 'object') return families;

    const entries = Object.entries(node as Record<string, unknown>);
    const directTokens = entries.filter(([, value]) => isTokenObject(value));

    if (directTokens.length > 0) {
        const familyName = normalizeColorFamilyName(path);
        if (!families[familyName]) families[familyName] = {};
        directTokens.forEach(([shadeName, token]) => {
            families[familyName][shadeName] = token;
        });
        return families;
    }

    entries.forEach(([key, value]) => {
        if (value && typeof value === 'object') {
            flattenColorFamilies(value, [...path, key], families);
        }
    });

    return families;
}

/**
 * FoundationTab - Displays all foundation tokens with scroll-spy navigation
 */
export function FoundationTab({ tokens, tokenMap, onTokenClick }: FoundationTabProps) {
    const rafId = useRef<number | null>(null);
    const pendingSectionId = useRef<string | null>(null);
    const [activeSection, setActiveSection] = useState<string>('');

    const sections = useMemo(() => {
        const items: Section[] = [];

        const { colorTree, spacingTree, sizingTree, radiusTree, typographyTree } = collectTypedTrees(tokens);
        const colorFamilies = flattenColorFamilies(colorTree);

        if (Object.keys(colorFamilies).length > 0) {
            items.push({
                id: 'colors-section',
                name: 'Colors',
                icon: 'colors',
                type: 'colors',
                tokens: colorFamilies,
                count: Object.keys(colorFamilies).length
            });
        }

        const spacingCount = findAllTokens(spacingTree as NestedTokens).length;
        if (spacingCount > 0) {
            items.push({ id: 'spacing-section', name: 'Spacing', icon: 'spacing', type: 'spacing', tokens: spacingTree, count: spacingCount });
        }

        const sizingCount = findAllTokens(sizingTree as NestedTokens).length;
        if (sizingCount > 0) {
            items.push({ id: 'sizes-section', name: 'Sizes', icon: 'sizes', type: 'sizing', tokens: sizingTree, count: sizingCount });
        }

        const radiusCount = findAllTokens(radiusTree as NestedTokens).length;
        if (radiusCount > 0) {
            items.push({ id: 'radius-section', name: 'Radius', icon: 'radius', type: 'radius', tokens: radiusTree, count: radiusCount });
        }

        const typographyCount = findAllTokens(typographyTree as NestedTokens).length;
        if (typographyCount > 0) {
            items.push({ id: 'typography-section', name: 'Typography', icon: 'typography', type: 'typography', tokens: typographyTree, count: typographyCount });
        }

        return items;
    }, [tokens]);

    // Initialize active section
    useEffect(() => {
        if (sections.length > 0 && !activeSection) {
            setActiveSection(sections[0].id);
        }
    }, [sections, activeSection]);

    // Scroll Spy (deterministic by scroll position)
    useEffect(() => {
        const getOffset = () => {
            const sticky = document.querySelector('.ftd-navbar-sticky') as HTMLElement | null;
            const base = sticky ? sticky.getBoundingClientRect().height : 160;
            const offset = Math.round(base + 16);
            document.documentElement.style.setProperty('--ftd-sticky-offset', `${offset}px`);
            return offset;
        };

        const updateActive = () => {
            const sectionElements = Array.from(document.querySelectorAll('.ftd-scroll-target')) as HTMLElement[];
            if (sectionElements.length === 0) return;

            const offset = getOffset();
            if (pendingSectionId.current) {
                const target = document.getElementById(pendingSectionId.current);
                if (!target) {
                    pendingSectionId.current = null;
                } else {
                    const top = target.getBoundingClientRect().top;
                    if (top - offset > 0) {
                        setActiveSection(pendingSectionId.current);
                        return;
                    }
                    pendingSectionId.current = null;
                }
            }
            const viewportTop = offset;
            const viewportBottom = window.innerHeight;
            let bestId = sectionElements[0].id;
            let bestVisible = -1;
            let bestTop = Infinity;

            for (const el of sectionElements) {
                const rect = el.getBoundingClientRect();
                const visibleTop = Math.max(rect.top, viewportTop);
                const visibleBottom = Math.min(rect.bottom, viewportBottom);
                const visible = Math.max(0, visibleBottom - visibleTop);
                if (visible > bestVisible || (visible === bestVisible && rect.top < bestTop)) {
                    bestVisible = visible;
                    bestId = el.id;
                    bestTop = rect.top;
                }
            }
            setActiveSection(bestId);
        };

        const onScroll = () => {
            if (rafId.current !== null) return;
            rafId.current = window.requestAnimationFrame(() => {
                rafId.current = null;
                updateActive();
            });
        };

        updateActive();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (rafId.current !== null) {
                window.cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
        };
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const sticky = document.querySelector('.ftd-navbar-sticky') as HTMLElement | null;
            const offset = (sticky ? sticky.getBoundingClientRect().height : 160) + 16;
            const top = window.scrollY + element.getBoundingClientRect().top - offset;
            setActiveSection(id);
            pendingSectionId.current = id;
            window.scrollTo({ top, behavior: 'smooth' });
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
                            <span className="ftd-nav-icon"><Icon name={section.icon} /></span>
                            <span className="ftd-nav-label">{section.name}</span>
                            <span className="ftd-nav-count">{section.count}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="ftd-color-content">
                {sections.map((section) => (
                    <React.Fragment key={section.id}>
                        {section.type === 'colors' && (
                            <div id={section.id} className="ftd-section ftd-scroll-target">
                                <div className="ftd-section-header">
                                    <div className="ftd-section-icon"><Icon name="colors" /></div>
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
                            <div id={section.id} className="ftd-scroll-target">
                                <SpacingDisplay tokens={section.tokens} onTokenClick={onTokenClick} />
                            </div>
                        )}

                        {section.type === 'sizing' && (
                            <div id={section.id} className="ftd-scroll-target">
                                <SizeDisplay tokens={section.tokens} onTokenClick={onTokenClick} />
                            </div>
                        )}

                        {section.type === 'radius' && (
                            <div id={section.id} className="ftd-scroll-target">
                                <RadiusDisplay tokens={section.tokens} onTokenClick={onTokenClick} />
                            </div>
                        )}

                        {section.type === 'typography' && (
                            <div id={section.id} className="ftd-section ftd-scroll-target">
                                <div className="ftd-section-header">
                                    <div className="ftd-section-icon"><Icon name="typography" /></div>
                                    <h2 className="ftd-section-title">{section.name}</h2>
                                    <span className="ftd-section-count">{section.count} tokens</span>
                                </div>
                                <TypographyDisplay tokens={section.tokens} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

function TypographyDisplay({ tokens }: { tokens: NestedTokens }) {
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const entries = findAllTokens(tokens).filter(({ path, token }) => normalizeTokenKind(token.type, path.split('.')) === 'typography');

    const showToast = (value: string) => {
        setCopiedValue(value);
        setTimeout(() => setCopiedValue(null), 2000);
    };

    if (entries.length === 0) return null;

    return (
        <>
            <div className="ftd-token-grid">
                {entries.map(({ path, token }) => {
                    const name = path;
                    const cssVar = toCssVariable(path);
                    const varValue = `var(${cssVar})`;
                    const lowerName = name.toLowerCase();
                    const isLineHeight = lowerName.includes('line');
                    const isFontSize = lowerName.includes('size') || lowerName.includes('font');

                    return (
                        <div
                            key={path}
                            className="ftd-display-card ftd-clickable-card"
                            data-token-name={name}
                            onClick={() => copyToClipboard(varValue).then(() => showToast(varValue))}
                            title={`Click to copy: ${varValue}`}
                        >
                            <div className="ftd-token-preview-container">
                                {isFontSize ? (
                                    <div
                                        style={{
                                            fontSize: token.value,
                                            fontWeight: 600,
                                            color: 'var(--ftd-primary)',
                                            lineHeight: 1
                                        }}
                                    >
                                        Aa
                                    </div>
                                ) : isLineHeight ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: token.value,
                                            width: '32px'
                                        }}
                                    >
                                        <div style={{ height: '2px', background: 'var(--ftd-primary)', width: '100%', opacity: 0.8 }} />
                                        <div style={{ height: '2px', background: 'var(--ftd-primary)', width: '100%', opacity: 0.8 }} />
                                    </div>
                                ) : (
                                    <div
                                        className="ftd-token-preview"
                                        style={{
                                            width: '16px',
                                            height: token.value,
                                            borderRadius: '2px',
                                        }}
                                    />
                                )}
                            </div>
                            <p className="ftd-token-card-label">{name}</p>
                            <div className="ftd-token-values-row">
                                <span className="ftd-token-css-var">
                                    {cssVar}
                                </span>
                                <span className="ftd-token-hex">
                                    {token.value}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

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
        </>
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
