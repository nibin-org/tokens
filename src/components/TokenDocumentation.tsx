'use client';

import React, { useState, useMemo } from 'react';
import type { TokenDocumentationProps } from '../types';
import { ColorGrid } from './ColorGrid';
import { SpacingScale } from './SpacingScale';
import { RadiusShowcase } from './RadiusShowcase';
import { SizeScale } from './SizeScale';

type TabType = string;

/**
 * TokenDocumentation - Main wrapper component for design token visualization
 * Now with improved UX and better component property display
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
    const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    // Extract token sets dynamically
    const tokenSets = Object.entries(tokens)
        .filter(([key]) => !['global', '$themes', '$metadata'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    // Detect token set types
    const detectTokenSetType = (tokenSet: any): string => {
        if (!tokenSet || typeof tokenSet !== 'object') return 'other';
        
        if (tokenSet.base || tokenSet.fill || tokenSet.stroke || tokenSet.text) {
            return 'colors';
        }
        
        const allTokens = Object.values(tokenSet).flat();
        const hasOnlyDimensions = allTokens.every((token: any) => 
            token && typeof token === 'object' && token.type === 'dimension'
        );
        
        if (hasOnlyDimensions) {
            const tokenNames = Object.keys(tokenSet).join(' ').toLowerCase();
            if (tokenNames.includes('space') || tokenNames.includes('spacing')) return 'spacing';
            if (tokenNames.includes('radius') || tokenNames.includes('border')) return 'radius';
            if (tokenNames.includes('size') || tokenNames.includes('width') || tokenNames.includes('height')) return 'sizes';
        }
        
        return 'other';
    };
    
    // Categorize token sets
    const categorizedSets = Object.entries(tokenSets).reduce((acc, [key, value]) => {
        const type = detectTokenSetType(value);
        if (!acc[type]) acc[type] = {};
        acc[type][key] = value;
        return acc;
    }, {} as Record<string, Record<string, any>>);
    
    const colorsValue = Object.values(categorizedSets.colors || {})[0];
    const spacingTokens = Object.values(categorizedSets.spacing || {})[0] || {};
    const sizeTokens = Object.values(categorizedSets.sizes || {})[0] || {};
    const radiusTokens = Object.values(categorizedSets.radius || {})[0] || {};
    const otherTokenSets = categorizedSets.other || {};

    // Available tabs
    const availableTabs = useMemo(() => {
        const tabs: { id: string; label: string; icon: string }[] = [];
        
        const typeConfig = {
            colors: { label: 'Colors', icon: '🎨' },
            spacing: { label: 'Spacing', icon: '📏' },
            sizes: { label: 'Sizes', icon: '📐' },
            radius: { label: 'Radius', icon: '⬜' }
        };
        
        Object.entries(categorizedSets).forEach(([type, sets]) => {
            if (Object.keys(sets).length > 0) {
                const config = typeConfig[type as keyof typeof typeConfig];
                if (config) {
                    tabs.push({ id: type, label: config.label, icon: config.icon });
                }
            }
        });
        
        if (Object.keys(otherTokenSets).length > 0) {
            tabs.push({ id: 'components', label: 'Components', icon: '🧩' });
        }

        return tabs;
    }, [categorizedSets, otherTokenSets]);

    const validActiveTab = availableTabs.some(t => t.id === activeTab)
        ? activeTab
        : (availableTabs[0] && availableTabs[0].id) || 'colors';

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleCopyToken = (value: string, name: string) => {
        navigator.clipboard.writeText(value);
        setCopiedToken(name);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    return (
        <div className="ftd-container" data-theme={isDarkMode ? 'dark' : 'light'}>
            {/* Copied Toast */}
            {copiedToken && (
                <div className="ftd-copied-toast">
                    Copied {copiedToken}
                </div>
            )}

            {/* Header */}
            <header className="ftd-header">
                <div className="ftd-title-wrapper">
                    <h1 className="ftd-title">{title}</h1>
                    <p className="ftd-subtitle">{subtitle}</p>
                </div>
                <button
                    className="ftd-theme-toggle"
                    onClick={toggleDarkMode}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <span className="ftd-theme-toggle-icon">{isDarkMode ? '☀️' : '🌙'}</span>
                    <span className="ftd-theme-toggle-text">{isDarkMode ? 'Light' : 'Dark'}</span>
                </button>
            </header>

            {/* Search */}
            {showSearch && (
                <div className="ftd-search-container">
                    <div className="ftd-search-wrapper">
                        <svg
                            className="ftd-search-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className="ftd-search-input"
                            placeholder="Search tokens..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Tabs */}
            {availableTabs.length > 1 && (
                <nav className="ftd-tabs" role="tablist">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`ftd-tab ${validActiveTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            role="tab"
                            aria-selected={validActiveTab === tab.id}
                        >
                            <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            )}

            {/* Tab Content */}
            <div role="tabpanel">
                {(() => {
                    if (validActiveTab === 'colors' && colorsValue) {
                        return (
                            <ColorGrid
                                baseColors={colorsValue.base}
                                fillColors={colorsValue.fill}
                                strokeColors={colorsValue.stroke}
                                textColors={colorsValue.text}
                                onColorClick={onTokenClick}
                            />
                        );
                    }
                    
                    if (validActiveTab === 'spacing') {
                        return (
                            <SpacingScale
                                tokens={spacingTokens}
                                onTokenClick={onTokenClick}
                            />
                        );
                    }
                    
                    if (validActiveTab === 'sizes') {
                        return (
                            <SizeScale
                                tokens={sizeTokens}
                                onTokenClick={onTokenClick}
                            />
                        );
                    }
                    
                    if (validActiveTab === 'radius') {
                        return (
                            <RadiusShowcase
                                tokens={radiusTokens}
                                onTokenClick={onTokenClick}
                            />
                        );
                    }
                    
                    // Enhanced Components Tab
                    if (validActiveTab === 'components') {
                        const allComponentTokens = Object.entries(otherTokenSets).reduce((acc, [setKey, setData]) => {
                            Object.entries(setData as any).forEach(([componentName, componentData]) => {
                                acc[`${setKey}/${componentName}`] = componentData;
                            });
                            return acc;
                        }, {} as Record<string, any>);
                        
                        return (
                            <div className="ftd-components-showcase">
                                {/* Header with Stats */}
                                <div className="ftd-showcase-header">
                                    <div className="ftd-showcase-title-group">
                                        <h2 className="ftd-showcase-title">Component Library</h2>
                                        <p className="ftd-showcase-subtitle">
                                            Explore interactive component tokens with all variants and properties
                                        </p>
                                    </div>
                                    <div className="ftd-showcase-stats">
                                        <div className="ftd-stat">
                                            <div className="ftd-stat-value">{Object.keys(allComponentTokens).length}</div>
                                            <div className="ftd-stat-label">Components</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Components Grid */}
                                <div className="ftd-components-grid">
                                    {Object.entries(allComponentTokens).map(([fullName, componentData]) => {
                                        const [setName, componentName] = fullName.split('/');
                                        const buttonData = componentData as any;
                                        
                                        // Find variants
                                        const allKeys = Object.keys(buttonData);
                                        const potentialVariants = allKeys.filter(key => {
                                            const item = buttonData[key];
                                            return item && 
                                                   typeof item === 'object' && 
                                                   item !== null &&
                                                   !item.hasOwnProperty('value') && 
                                                   Object.values(item).some((subItem: any) => 
                                                       subItem && typeof subItem === 'object' && subItem.hasOwnProperty('value')
                                                   );
                                        });
                                        
                                        if (potentialVariants.length === 0) return null;
                                        
                                        const isExpanded = expandedComponent === fullName;
                                        
                                        return (
                                            <div key={fullName} className="ftd-component-card">
                                                {/* Component Header */}
                                                <div className="ftd-component-header">
                                                    <div className="ftd-component-title-group">
                                                        <div className="ftd-component-icon">🧩</div>
                                                        <div>
                                                            <h3 className="ftd-component-title">{componentName}</h3>
                                                            <div className="ftd-component-meta">
                                                                {potentialVariants.length} variants · {
                                                                    Object.keys(buttonData[potentialVariants[0]] || {}).length
                                                                } properties each
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        className="ftd-expand-button"
                                                        onClick={() => setExpandedComponent(isExpanded ? null : fullName)}
                                                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                    >
                                                        <svg 
                                                            width="20" 
                                                            height="20" 
                                                            viewBox="0 0 24 24" 
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            strokeWidth="2"
                                                            style={{ 
                                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.2s ease'
                                                            }}
                                                        >
                                                            <polyline points="6 9 12 15 18 9"></polyline>
                                                        </svg>
                                                    </button>
                                                </div>
                                                
                                                {/* Variants */}
                                                <div className="ftd-variants-container">
                                                    {potentialVariants.map((variant, index) => {
                                                        const variantData = buttonData[variant];
                                                        const variantTokens = Object.entries(variantData);
                                                        
                                                        // Get tokens for preview
                                                        const fillToken = variantTokens.find(([key]) => 
                                                            key.toLowerCase().includes('fill') || key.toLowerCase().includes('background')
                                                        );
                                                        const strokeToken = variantTokens.find(([key]) => 
                                                            key.toLowerCase().includes('stroke') || key.toLowerCase().includes('border')
                                                        );
                                                        const textToken = variantTokens.find(([key]) => 
                                                            key.toLowerCase().includes('text') && !key.toLowerCase().includes('hover')
                                                        );
                                                        
                                                        const fillColor = fillToken ? (fillToken[1] as any).value : '#6366f1';
                                                        const strokeColor = strokeToken ? (strokeToken[1] as any).value : 'transparent';
                                                        const textColor = textToken ? (textToken[1] as any).value : '#ffffff';
                                                        
                                                        // Show only first 3 variants in collapsed state
                                                        if (!isExpanded && index >= 3) return null;
                                                        
                                                        return (
                                                            <div key={variant} className="ftd-variant-card">
                                                                {/* Variant Header */}
                                                                <div className="ftd-variant-header">
                                                                    <div className="ftd-variant-badge">{variant}</div>
                                                                    <div className="ftd-variant-colors">
                                                                        {fillColor !== 'transparent' && (
                                                                            <div 
                                                                                className="ftd-color-preview" 
                                                                                style={{ backgroundColor: fillColor }}
                                                                                title={`Fill: ${fillColor}`}
                                                                            />
                                                                        )}
                                                                        {textColor !== fillColor && textColor !== '#ffffff' && (
                                                                            <div 
                                                                                className="ftd-color-preview ftd-color-preview-small" 
                                                                                style={{ backgroundColor: textColor }}
                                                                                title={`Text: ${textColor}`}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Interactive Preview */}
                                                                <div className="ftd-preview-area">
                                                                    <button 
                                                                        className="ftd-preview-button"
                                                                        style={{
                                                                            backgroundColor: fillColor,
                                                                            color: textColor,
                                                                            border: strokeColor !== 'transparent' ? `2px solid ${strokeColor}` : 'none',
                                                                        }}
                                                                    >
                                                                        {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
                                                                    </button>
                                                                </div>
                                                                
                                                                {/* Token Properties Table */}
                                                                {isExpanded && (
                                                                    <div className="ftd-properties-table">
                                                                        <div className="ftd-properties-header">
                                                                            <span>Property</span>
                                                                            <span>Value</span>
                                                                        </div>
                                                                        {variantTokens.map(([tokenName, tokenData]) => {
                                                                            const data = tokenData as any;
                                                                            const isColor = data.type === 'color';
                                                                            const fullTokenPath = `${componentName}.${variant}.${tokenName}`;
                                                                            
                                                                            return (
                                                                                <div
                                                                                    key={tokenName}
                                                                                    className="ftd-property-row"
                                                                                    onClick={() => handleCopyToken(data.value, fullTokenPath)}
                                                                                >
                                                                                    <div className="ftd-property-name">
                                                                                        {isColor && (
                                                                                            <div 
                                                                                                className="ftd-property-swatch" 
                                                                                                style={{ backgroundColor: data.value }}
                                                                                            />
                                                                                        )}
                                                                                        <span className="ftd-property-label">
                                                                                            {tokenName.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="ftd-property-value-group">
                                                                                        <code className="ftd-property-value">
                                                                                            {data.value}
                                                                                        </code>
                                                                                        <svg 
                                                                                            className="ftd-copy-icon"
                                                                                            width="14" 
                                                                                            height="14" 
                                                                                            viewBox="0 0 24 24" 
                                                                                            fill="none" 
                                                                                            stroke="currentColor" 
                                                                                            strokeWidth="2"
                                                                                        >
                                                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    
                                                    {/* Show More Button */}
                                                    {!isExpanded && potentialVariants.length > 3 && (
                                                        <button 
                                                            className="ftd-show-more-button"
                                                            onClick={() => setExpandedComponent(fullName)}
                                                        >
                                                            + {potentialVariants.length - 3} more variants
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }
                    
                    return null;
                })()}
            </div>

            {/* Empty State */}
            {availableTabs.length === 0 && (
                <div className="ftd-empty">
                    <div className="ftd-empty-icon">📦</div>
                    <h4 className="ftd-empty-title">No tokens found</h4>
                    <p className="ftd-empty-text">
                        Pass a valid tokens.json file from Figma Token Studio
                    </p>
                </div>
            )}
        </div>
    );
}

export default TokenDocumentation;