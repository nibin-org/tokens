import React, { useState } from 'react';
import type { FigmaTokens, PlaygroundLockOptions } from '../types';
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
    lock?: PlaygroundLockOptions;
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

export function PlaygroundTab({ tokens, tokenMap, config, setConfig, activeTab, setActiveTab, onReset, lock }: PlaygroundTabProps) {
    const [activeComponent, setActiveComponent] = useState('button');
    const isLocked = Boolean(lock?.enabled);
    const lockTitle = lock?.title || 'Read-only in shared preview';
    const lockDescription = lock?.description || 'Install tokvista in your project to unlock full interactive sandbox editing and export.';
    const lockActionLabel = lock?.actionLabel || 'Install tokvista';

    const components = [
        { id: 'button', label: 'Button' },
        // { id: 'card', label: 'Card' }, // Future
    ];

    return (
        <div className="ftd-playground-container">
            <div className="ftd-source-banner sandbox">
                <div className="ftd-source-badge sandbox">Experimentation Area</div>
                <p className="ftd-source-text">
                    Interactive sandbox for custom builds. Experiment with any available tokens to create and export unique component variations.
                </p>
            </div>
            <PlaygroundToolbar
                activeComponent={activeComponent}
                onComponentChange={setActiveComponent}
            />

            <div className={`ftd-playground-content ${isLocked ? 'ftd-playground-content-locked' : ''}`}>
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
                {isLocked && (
                    <div className="ftd-playground-lock-overlay" role="note" aria-label="Interactive sandbox locked">
                        <div className="ftd-playground-lock-card">
                            <h4 className="ftd-playground-lock-title">{lockTitle}</h4>
                            <p className="ftd-playground-lock-text">{lockDescription}</p>
                            {typeof lock?.onAction === 'function' && (
                                <button
                                    type="button"
                                    className="ftd-playground-lock-btn"
                                    onClick={lock.onAction}
                                >
                                    {lockActionLabel}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
