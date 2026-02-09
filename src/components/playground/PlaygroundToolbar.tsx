import React from 'react';

export interface PlaygroundToolbarProps {
    activeComponent: string;
    onComponentChange: (id: string) => void;
}

export function PlaygroundToolbar({ activeComponent, onComponentChange }: PlaygroundToolbarProps) {
    const components = [
        { id: 'button', label: 'Button', icon: '🔘' },
        { id: 'input', label: 'Input', icon: '⌨️', disabled: true },
        { id: 'card', label: 'Card', icon: '🎴', disabled: true },
        { id: 'badge', label: 'Badge', icon: '🏷️', disabled: true },
    ];

    return (
        <div className="ftd-playground-toolbar-v2">
            <div className="ftd-playground-toolbar-header">
                <h3 className="ftd-playground-toolbar-title">Playground</h3>
                <p className="ftd-playground-toolbar-subtitle">Test and customize components with your design tokens</p>
            </div>

            <div className="ftd-playground-tabs-v2">
                {components.map((comp) => (
                    <button
                        key={comp.id}
                        type="button"
                        disabled={comp.disabled}
                        className={`ftd-playground-tab-btn-v2 ${activeComponent === comp.id ? 'active' : ''} ${comp.disabled ? 'disabled' : ''}`}
                        onClick={() => !comp.disabled && onComponentChange(comp.id)}
                        title={comp.disabled ? 'Coming soon' : comp.label}
                    >
                        <span className="ftd-playground-tab-icon">{comp.icon}</span>
                        <span className="ftd-playground-tab-label">{comp.label}</span>
                        {comp.disabled && <span className="ftd-playground-tab-badge">Soon</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}
