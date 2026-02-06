'use client';

import React, { useState } from 'react';

interface ComponentsTabProps {
    components: Record<string, ComponentData>;
    onCopy: (value: string, label: string) => void;
}

interface ComponentData {
    variants: Record<string, any>;
    dimensions: Record<string, any>;
}

interface Section {
    id: string;
    name: string;
    icon: string;
    data: ComponentData;
}

/**
 * ComponentsTab - Displays component tokens with sidebar navigation
 */
export function ComponentsTab({ components, onCopy }: ComponentsTabProps) {
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
                <div className="ftd-empty-icon">🧩</div>
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
                                <span className="ftd-nav-icon">{section.icon}</span>
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
                            data={activeData.data}
                            onCopy={onCopy}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Display a single component with its variants and/or dimensions
 */
function ComponentDisplay({
    name,
    data,
    onCopy
}: {
    name: string;
    data: ComponentData;
    onCopy: (value: string, label: string) => void;
}) {
    const variants = Object.keys(data.variants);
    const dimensions = Object.keys(data.dimensions);

    return (
        <div className="ftd-section">
            <div className="ftd-section-header">
                <div className="ftd-section-icon">🧩</div>
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
                            <div className="ftd-dimension-items">
                                {Object.entries(dimGroup as any).map(([sizeName, sizeToken]: [string, any]) => (
                                    <div
                                        key={sizeName}
                                        className="ftd-dimension-item"
                                        onClick={() => onCopy(sizeToken.value, sizeName)}
                                    >
                                        <span className="ftd-dimension-label">{sizeName}</span>
                                        <code className="ftd-dimension-value">{sizeToken.value}</code>
                                    </div>
                                ))}
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
function getComponentIcon(componentName: string): string {
    const iconMap: Record<string, string> = {
        button: '🔘',
        input: '📝',
        card: '🎴',
        modal: '🪟',
        dropdown: '📋',
        checkbox: '☑️',
        radio: '⭕',
        toggle: '🔘',
        slider: '🎚️',
        badge: '🏷️',
        alert: '⚠️',
        tooltip: '💬',
        avatar: '👤',
        default: '🧩'
    };

    const key = componentName.toLowerCase();
    return iconMap[key] || iconMap.default;
}

export default ComponentsTab;
