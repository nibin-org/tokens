import React from 'react';
import { Icon } from '../Icon';

export interface PlaygroundToolbarProps {
    activeComponent: string;
    onComponentChange: (id: string) => void;
}

export function PlaygroundToolbar({ activeComponent, onComponentChange }: PlaygroundToolbarProps) {
    const components = [
        { id: 'button', label: 'Button', icon: 'button' as const },
        { id: 'input', label: 'Input', icon: 'input' as const, disabled: true },
        { id: 'card', label: 'Card', icon: 'card' as const, disabled: true },
        { id: 'badge', label: 'Badge', icon: 'badge' as const, disabled: true },
    ];

    return (
        <div className="ftd-playground-toolbar-v2">
            <div className="ftd-playground-toolbar-header">
                <div className="ftd-playground-toolbar-title-row">
                    <h3 className="ftd-playground-toolbar-title">Playground</h3>
                    <span className="ftd-tab-badge ftd-tab-badge-lab">Custom</span>
                </div>
                <p className="ftd-playground-toolbar-subtitle">Experiment (not spec). Outputs are for exploration.</p>
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
                        <span className="ftd-playground-tab-icon"><Icon name={comp.icon} /></span>
                        <span className="ftd-playground-tab-label">{comp.label}</span>
                        {comp.disabled && <span className="ftd-playground-tab-badge">Soon</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}
