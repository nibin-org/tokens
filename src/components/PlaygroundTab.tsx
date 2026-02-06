import React, { useState } from 'react';
import type { FigmaTokens } from '../types';
import { ButtonPlayground } from './playground/ButtonPlayground';

interface PlaygroundTabProps {
    tokens: FigmaTokens;
    tokenMap: Record<string, string>;
}

export function PlaygroundTab({ tokens, tokenMap }: PlaygroundTabProps) {
    const [activeComponent, setActiveComponent] = useState('button');

    const components = [
        { id: 'button', label: 'Button' },
        // { id: 'card', label: 'Card' }, // Future
    ];

    return (
        <div className="ftd-playground-container">
            <div className="ftd-playground-toolbar">
                <span className="ftd-playground-label">Component:</span>
                <div className="ftd-playground-tabs">
                    {components.map(comp => (
                        <button
                            key={comp.id}
                            className={`ftd-playground-tab-btn ${activeComponent === comp.id ? 'active' : ''}`}
                            onClick={() => setActiveComponent(comp.id)}
                        >
                            {comp.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="ftd-playground-content">
                {activeComponent === 'button' && (
                    <ButtonPlayground tokens={tokens} tokenMap={tokenMap} />
                )}
            </div>
        </div>
    );
}
