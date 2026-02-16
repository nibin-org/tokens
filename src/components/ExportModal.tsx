import React, { useState, useEffect, useRef } from 'react';
import type { FigmaTokens } from '../types';
import { generateCSS, generateSCSS, generateJS, generateTailwind } from '../utils/exportUtils';

import { highlightCode } from '../utils/highlighter';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    tokens: FigmaTokens;
}

type ExportTab = 'css' | 'scss' | 'js' | 'tailwind';

export function ExportModal({ isOpen, onClose, tokens }: ExportModalProps) {
    const [activeTab, setActiveTab] = useState<ExportTab>('css');
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLPreElement>(null);

    const generatedCode = React.useMemo(() => {
        switch (activeTab) {
            case 'css': return generateCSS(tokens);
            case 'scss': return generateSCSS(tokens);
            case 'js': return generateJS(tokens);
            case 'tailwind': return generateTailwind(tokens);
        }
    }, [activeTab, tokens]);

    useEffect(() => {
        if (isOpen) {
            setCopied(false);
        }
    }, [isOpen, activeTab]);

    const handleCopy = async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(generatedCode);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = generatedCode;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const handleDownload = () => {
        const extensions = { css: 'css', scss: 'scss', js: 'js', tailwind: 'js' };
        const filename = activeTab === 'tailwind' ? 'tailwind.config.js' : `tokens.${extensions[activeTab]}`;
        const blob = new Blob([generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const tabs: { id: ExportTab; label: string }[] = [
        { id: 'css', label: 'CSS Variables' },
        { id: 'scss', label: 'SCSS' },
        { id: 'js', label: 'JavaScript' },
        { id: 'tailwind', label: 'Tailwind' },
    ];

    return (
        <div className="ftd-export-modal" onClick={handleBackdropClick}>
            <div className="ftd-export-container">
                <div className="ftd-export-header">
                    <div className="ftd-export-title-group">
                        <h2 className="ftd-export-title">Export Tokens</h2>
                        <p className="ftd-export-subtitle">Generate and download code snippets for your project</p>
                    </div>
                    <button className="ftd-export-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="ftd-export-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`ftd-export-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="ftd-export-body">
                    <div className="ftd-export-code-wrapper">
                        <div className="ftd-export-actions">
                            <button className="ftd-export-action-btn" onClick={handleCopy}>
                                {copied ? 'Copied!' : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                            <button className="ftd-export-action-btn" onClick={handleDownload}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download
                            </button>
                        </div>
                        <pre ref={codeRef} className={`ftd-export-code ftd-lang-${activeTab}`}>
                            <code dangerouslySetInnerHTML={{ __html: highlightCode(generatedCode || '', activeTab === 'tailwind' ? 'js' : activeTab) }} />
                        </pre>
                    </div>
                </div>

                <div className="ftd-export-footer">
                    <div className="ftd-export-ai-note">
                        <svg className="ftd-ai-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"></path>
                            <path d="M5 3v4"></path>
                            <path d="M3 5h4"></path>
                            <path d="M21 17v4"></path>
                            <path d="M19 19h4"></path>
                        </svg>
                        <span>Tokens intelligently generated by <strong>Tokvista</strong></span>
                    </div>
                    <button className="ftd-btn-primary" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
}
