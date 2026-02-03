'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ColorGridProps, ParsedColorToken, NestedTokens } from '../types';
import { parseBaseColors, parseSemanticColors, getContrastColor, copyToClipboard, isTokenValue } from '../utils';

/**
 * Build a lookup map of all color values from base colors
 */
function buildColorLookup(baseColors?: NestedTokens): Record<string, string> {
    if (!baseColors) return {};

    const lookup: Record<string, string> = {};

    for (const [familyName, shades] of Object.entries(baseColors)) {
        if (typeof shades !== 'object' || shades === null) continue;

        for (const [shadeName, token] of Object.entries(shades as NestedTokens)) {
            if (isTokenValue(token)) {
                // Add multiple key formats for flexibility
                lookup[`{base.${familyName}.${shadeName}}`] = token.value;
                lookup[`base.${familyName}.${shadeName}`] = token.value;
            }
        }
    }

    return lookup;
}

/**
 * Resolve an alias to its actual color value
 */
function resolveAlias(value: string, lookup: Record<string, string>): string | null {
    if (!value.startsWith('{')) return null;

    // Direct lookup
    if (lookup[value]) return lookup[value];

    // Try without braces
    const inner = value.slice(1, -1);
    if (lookup[inner]) return lookup[inner];

    return null;
}

/**
 * Group semantic colors by their base family name
 * e.g., blue, blue-light, blue-dark -> blue family
 */
interface ColorGroup {
    family: string;
    colors: ParsedColorToken[];
    primaryColor: string;
}

function groupColorsByFamily(colors: ParsedColorToken[]): ColorGroup[] {
    const groups: Record<string, ParsedColorToken[]> = {};

    colors.forEach(color => {
        // Extract base family: "blue-light" -> "blue", "gray-dark" -> "gray"
        const parts = color.name.split('-');
        const family = parts[0].toLowerCase();

        if (!groups[family]) {
            groups[family] = [];
        }
        groups[family].push(color);
    });

    // Convert to array and determine primary color for each group
    return Object.entries(groups).map(([family, groupColors]) => {
        // Find the "base" color (no suffix) or use first one
        const baseColor = groupColors.find(c => c.name.toLowerCase() === family) || groupColors[0];
        return {
            family: family.charAt(0).toUpperCase() + family.slice(1),
            colors: groupColors,
            primaryColor: baseColor.resolvedValue || baseColor.value,
        };
    });
}

/**
 * ColorGrid - Beautiful visualization of color tokens
 * Displays base colors as shade scales and semantic colors as grids
 */
export function ColorGrid({
    baseColors,
    fillColors,
    strokeColors,
    textColors,
    onColorClick,
}: ColorGridProps) {
    const [copiedValue, setCopiedValue] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string>('base');
    const observer = useRef<IntersectionObserver | null>(null);

    // Function to show toast notification
    const showToast = useCallback((value: string) => {
        setCopiedValue(value);
        setTimeout(() => setCopiedValue(null), 2000);
    }, []);

    // Scroll Spy Logic
    useEffect(() => {
        const options = {
            rootMargin: '-180px 0px -50% 0px', // Matches sticky header + margin
            threshold: 0
        };

        observer.current = new IntersectionObserver((entries) => {
            // Find the first entry that is intersecting
            const intersecting = entries.find(entry => entry.isIntersecting);
            if (intersecting) {
                setActiveSection(intersecting.target.id);
            }
        }, options);

        const sections = document.querySelectorAll('.ftd-color-section');
        sections.forEach((section) => observer.current?.observe(section));

        return () => observer.current?.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // Manually set active state for instant feedback and to handle edge cases (like last section)
            setActiveSection(id);
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Build color lookup for resolving aliases
    const colorLookup = useMemo(() => buildColorLookup(baseColors), [baseColors]);

    const handleCopy = useCallback(async (color: ParsedColorToken) => {
        const valueToCopy = color.resolvedValue || color.value;
        const success = await copyToClipboard(valueToCopy);
        if (success) {
            showToast(valueToCopy);
        }
        onColorClick?.(color);
    }, [onColorClick, showToast]);

    const colorFamilies = baseColors ? parseBaseColors(baseColors) : [];

    // Parse semantic colors and resolve aliases
    const parseWithResolution = (tokens: NestedTokens | undefined, prefix: string) => {
        if (!tokens) return [];
        return parseSemanticColors(tokens, prefix).map(color => ({
            ...color,
            resolvedValue: resolveAlias(color.value, colorLookup) || undefined,
        }));
    };

    const semanticFill = fillColors ? parseWithResolution(fillColors, 'fill') : [];
    const semanticStroke = strokeColors ? parseWithResolution(strokeColors, 'stroke') : [];
    const semanticText = textColors ? parseWithResolution(textColors, 'text') : [];

    const navItems = [
        { id: 'base-colors', label: 'Base Colors', icon: '🎨', count: colorFamilies.length },
        { id: 'fill-colors', label: 'Fill Colors', icon: '🖼️', count: semanticFill.length },
        { id: 'stroke-colors', label: 'Stroke Colors', icon: '✏️', count: semanticStroke.length },
        { id: 'text-colors', label: 'Text Colors', icon: '📝', count: semanticText.length },
    ].filter(item => item.count > 0);

    return (
        <div className="ftd-color-layout">
            <aside className="ftd-color-sidebar">
                <nav className="ftd-color-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`ftd-color-nav-link ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(item.id)}
                        >
                            <span className="ftd-nav-icon">{item.icon}</span>
                            <span className="ftd-nav-label">{item.label}</span>
                            <span className="ftd-nav-count">{item.count}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="ftd-color-content">
                {/* Base Colors */}
                {colorFamilies.length > 0 && (
                    <div id="base-colors" className="ftd-section ftd-color-section">
                        <div className="ftd-section-header">
                            <div className="ftd-section-icon">🎨</div>
                            <h3 className="ftd-section-title">Base Colors</h3>
                            <span className="ftd-section-count">{colorFamilies.length} families</span>
                        </div>
                        <div className="ftd-color-family-container">
                            {colorFamilies.map((family) => (
                                <div key={family.name} className="ftd-color-family">
                                    <div className="ftd-color-family-header">
                                        <div
                                            className="ftd-color-family-swatch"
                                            style={{ backgroundColor: family.primaryColor }}
                                        />
                                        <h4 className="ftd-color-family-name">{family.name}</h4>
                                    </div>

                                    <div className="ftd-color-scale">
                                        {family.shades.map((shade) => (
                                            <div
                                                key={shade.name}
                                                className="ftd-color-shade"
                                                style={{
                                                    backgroundColor: shade.value,
                                                    color: getContrastColor(shade.value),
                                                }}
                                            >
                                                <span className="ftd-color-shade-label">{shade.shade}</span>
                                                <div className="ftd-shade-values">
                                                    <span
                                                        className="ftd-shade-css-var"
                                                        onClick={() => copyToClipboard(shade.cssVariable).then(() => {
                                                            showToast(shade.cssVariable);
                                                        })}
                                                        title={`Click to copy: ${shade.cssVariable}`}
                                                    >
                                                        {shade.cssVariable}
                                                    </span>
                                                    <span
                                                        className="ftd-shade-hex"
                                                        onClick={() => handleCopy(shade)}
                                                        title={`Click to copy: ${shade.value}`}
                                                    >
                                                        {shade.value.substring(0, 7)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Semantic Fill Colors */}
                {semanticFill.length > 0 && (
                    <div id="fill-colors" className="ftd-section ftd-color-section">
                        <div className="ftd-section-header">
                            <div className="ftd-section-icon">🖼️</div>
                            <h3 className="ftd-section-title">Fill Colors</h3>
                            <span className="ftd-section-count">{semanticFill.length} tokens</span>
                        </div>

                        <div className="ftd-semantic-families">
                            {groupColorsByFamily(semanticFill).map((group) => (
                                <div key={group.family} className="ftd-semantic-family">
                                    <div className="ftd-semantic-family-header">
                                        <div
                                            className="ftd-color-family-swatch"
                                            style={{ backgroundColor: group.primaryColor.startsWith('{') ? '#ccc' : group.primaryColor }}
                                        />
                                        <h4 className="ftd-color-family-name">{group.family}</h4>
                                    </div>
                                    <div className="ftd-semantic-family-colors">
                                        {group.colors.map((color) => (
                                            <ColorCard
                                                key={color.name}
                                                color={color}
                                                onCopy={handleCopy}
                                                onCopyText={showToast}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Semantic Stroke Colors */}
                {semanticStroke.length > 0 && (
                    <div id="stroke-colors" className="ftd-section ftd-color-section">
                        <div className="ftd-section-header">
                            <div className="ftd-section-icon">✏️</div>
                            <h3 className="ftd-section-title">Stroke Colors</h3>
                            <span className="ftd-section-count">{semanticStroke.length} tokens</span>
                        </div>

                        <div className="ftd-semantic-families">
                            {groupColorsByFamily(semanticStroke).map((group) => (
                                <div key={group.family} className="ftd-semantic-family">
                                    <div className="ftd-semantic-family-header">
                                        <div
                                            className="ftd-color-family-swatch"
                                            style={{ backgroundColor: group.primaryColor.startsWith('{') ? '#ccc' : group.primaryColor }}
                                        />
                                        <h4 className="ftd-color-family-name">{group.family}</h4>
                                    </div>
                                    <div className="ftd-semantic-family-colors">
                                        {group.colors.map((color) => (
                                            <ColorCard
                                                key={color.name}
                                                color={color}
                                                onCopy={handleCopy}
                                                onCopyText={showToast}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Semantic Text Colors */}
                {semanticText.length > 0 && (
                    <div id="text-colors" className="ftd-section ftd-color-section">
                        <div className="ftd-section-header">
                            <div className="ftd-section-icon">📝</div>
                            <h3 className="ftd-section-title">Text Colors</h3>
                            <span className="ftd-section-count">{semanticText.length} tokens</span>
                        </div>

                        <div className="ftd-semantic-families">
                            {groupColorsByFamily(semanticText).map((group) => (
                                <div key={group.family} className="ftd-semantic-family">
                                    <div className="ftd-semantic-family-header">
                                        <div
                                            className="ftd-color-family-swatch"
                                            style={{ backgroundColor: group.primaryColor.startsWith('{') ? '#ccc' : group.primaryColor }}
                                        />
                                        <h4 className="ftd-color-family-name">{group.family}</h4>
                                    </div>
                                    <div className="ftd-semantic-family-colors">
                                        {group.colors.map((color) => (
                                            <ColorCard
                                                key={color.name}
                                                color={color}
                                                onCopy={handleCopy}
                                                onCopyText={showToast}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Copy Toast */}
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
        </div>
    );
}

/**
 * Individual color card component
 */
interface ColorCardInternalProps {
    color: ParsedColorToken;
    onCopy: (color: ParsedColorToken) => void;
    onCopyText: (text: string) => void;
}

function ColorCard({ color, onCopy, onCopyText }: ColorCardInternalProps) {
    // Determine if this is an alias (reference to another token)
    const isAlias = color.value.startsWith('{');
    const displayValue = isAlias ? color.value : color.value.substring(0, 9);

    // Use resolved value for background, fall back to actual value or placeholder
    const bgColor = color.resolvedValue || (isAlias ? '#cccccc' : color.value);
    const textColor = getContrastColor(bgColor);

    // Handle CSS variable copy
    const handleCssVarCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await copyToClipboard(color.cssVariable);
        if (success) {
            onCopyText(color.cssVariable);
        }
    };

    // Handle value copy
    const handleValueCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopy(color);
    };

    return (
        <div className="ftd-token-card">
            <div
                className="ftd-token-swatch"
                style={{
                    backgroundColor: bgColor,
                    color: textColor,
                }}
            >
                {isAlias && (
                    <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        opacity: 0.85,
                    }}>
                        Alias →
                    </span>
                )}
            </div>
            <div className="ftd-token-info">
                <p className="ftd-token-name">{color.name}</p>
                <div className="ftd-token-values-row">
                    <span
                        className="ftd-token-css-var"
                        onClick={handleCssVarCopy}
                        title={`Click to copy: ${color.cssVariable}`}
                    >
                        {color.cssVariable}
                    </span>
                    <span
                        className="ftd-token-hex"
                        onClick={handleValueCopy}
                        title={`Click to copy: ${color.resolvedValue || color.value}`}
                    >
                        {displayValue}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ColorGrid;
