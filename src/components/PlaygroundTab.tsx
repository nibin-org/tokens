import React, { useState } from 'react';
import type { FigmaTokens } from '../types';
import { ButtonPlayground } from './playground/ButtonPlayground';
import { PlaygroundToolbar } from './playground/PlaygroundToolbar';

interface PlaygroundTabProps {
    tokens: FigmaTokens;
    tokenMap: Record<string, string>;
    config: PlaygroundConfig;
    setConfig: React.Dispatch<React.SetStateAction<PlaygroundConfig>>;
    activeTab: 'css' | 'scss' | 'tailwind';
    setActiveTab: React.Dispatch<React.SetStateAction<'css' | 'scss' | 'tailwind'>>;
    onReset: () => void;
}

export type PlaygroundConfig = {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderRadius: string;
    paddingX: string;
    paddingY: string;
    fontSize: string;
    lineHeight: string;
    hoverBackgroundColor: string;
    hoverTextColor: string;
    hoverBorderColor: string;
    // content
    buttonText: string;
    isFullWidth: boolean;
    showIcon: boolean;
    // active state
    activeBackgroundColor: string;
    activeTextColor: string;
    activeBorderColor: string;
    // custom class
    className: string;
};

export function PlaygroundTab({ tokens, tokenMap, config, setConfig, activeTab, setActiveTab, onReset }: PlaygroundTabProps) {
    const [activeComponent, setActiveComponent] = useState('button');

    const components = [
        { id: 'button', label: 'Button' },
        // { id: 'card', label: 'Card' }, // Future
    ];

    return (
        <div className="ftd-playground-container">
            <PlaygroundToolbar
                activeComponent={activeComponent}
                onComponentChange={setActiveComponent}
            />

            <div className="ftd-playground-content">
                {activeComponent === 'button' && (
                    <ButtonPlayground
                        tokens={tokens}
                        tokenMap={tokenMap}
                        config={config}
                        setConfig={setConfig}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onReset={onReset}
                    />
                )}
            </div>
        </div>
    );
}
