'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { NestedTokens } from '../types';
import { getContrastColor } from '../utils/color';
import { copyToClipboard } from '../utils/ui';
import { Icon } from './Icon';
import { findAllTokens, resolveTokenValue, toCssVariable } from '../utils/core';

interface ComponentsTabProps {
    tokens: NestedTokens;
    tokenMap: Record<string, string>;
    onTokenClick?: (token: any) => void;
}

interface ParsedToken {
    name: string;
    value: string;
    resolvedValue: string;
    cssVariable: string;
    type: string;
}

interface Section {
    id: string;
    name: string;
    icon: 'fill' | 'stroke' | 'text';
    groups: Record<string, ParsedToken[]>;
}

export function ComponentsTab({ tokens, tokenMap, onTokenClick }: ComponentsTabProps) {
    const rafId = useRef<number | null>(null);
    const pendingSectionId = useRef<string | null>(null);
    const [copiedToast, setCopiedToast] = useState<{ id: number; value: string } | null>(null);
    const [activeSection, setActiveSection] = useState<string>('');
    const toastIdRef = useRef(0);
    const toastTimerRef = useRef<number | null>(null);

    // Parse all component tokens dynamically
    const sections = useMemo<Section[]>(() => {
        const sectionList: Section[] = [];
        
        Object.keys(tokens).forEach(componentKey => {
            const componentTokens = tokens[componentKey] as NestedTokens;
            const allTokens = findAllTokens(componentTokens);
            
            if (allTokens.length === 0) return;
            
            // Group tokens by their parent path (variant/group name)
            const groups: Record<string, ParsedToken[]> = {};
            
            allTokens.forEach(({ path, token }) => {
                const value = typeof token.value === 'string' ? token.value : String(token.value);
                const parts = path.split('.');
                const groupName = parts.length > 1 ? parts[0] : 'default';
                
                if (!groups[groupName]) {
                    groups[groupName] = [];
                }
                
                groups[groupName].push({
                    name: path,
                    value,
                    resolvedValue: resolveTokenValue(value, tokenMap),
                    cssVariable: toCssVariable(path, componentKey),
                    type: token.type || 'unknown',
                });
            });
            
            let icon: 'fill' | 'stroke' | 'text' = 'fill';
            if (componentKey.toLowerCase().includes('border')) {
                icon = 'stroke';
            } else if (componentKey.toLowerCase().includes('text')) {
                icon = 'text';
            }
            
            sectionList.push({
                id: `${componentKey}-section`,
                name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1),
                icon,
                groups,
            });
        });
        
        return sectionList;
    }, [tokens, tokenMap]);

    useEffect(() => {
        if (sections.length > 0 && !activeSection) {
            setActiveSection(sections[0].id);
        }
    }, [sections, activeSection]);

    useEffect(() => {
        const getOffset = () => {
            const sticky = document.querySelector('.ftd-navbar-sticky') as HTMLElement | null;
            const base = sticky ? sticky.getBoundingClientRect().height : 160;
            const offset = Math.round(base + 16);
            document.documentElement.style.setProperty('--ftd-sticky-offset', `${offset}px`);
            return offset;
        };

        const updateActive = () => {
            const sectionElements = Array.from(document.querySelectorAll('.ftd-component-section')) as HTMLElement[];
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

    const showToast = (value: string) => {
        const id = ++toastIdRef.current;
        setCopiedToast({ id, value });
        if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => {
            setCopiedToast((current) => (current && current.id === id ? null : current));
            toastTimerRef.current = null;
        }, 2000);
    };

    useEffect(() => () => {
        if (toastTimerRef.current !== null) {
            window.clearTimeout(toastTimerRef.current);
        }
    }, []);

    const handleCopy = async (token: ParsedToken) => {
        const fullCssVar = `var(${token.cssVariable})`;
        const success = await copyToClipboard(fullCssVar);
        if (success) showToast(fullCssVar);
        onTokenClick?.(token);
    };

    if (sections.length === 0) {
        return <div className="ftd-empty">No component tokens found</div>;
    }

    const totalGroups = sections.reduce((sum, s) => sum + Object.keys(s.groups).length, 0);

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
                            <span className="ftd-nav-count">{Object.keys(section.groups).length}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="ftd-color-content">
                {sections.map((section) => (
                    <div key={section.id} id={section.id} className="ftd-component-section ftd-section ftd-scroll-target">
                        <div className="ftd-section-header">
                            <div className="ftd-section-icon"><Icon name={section.icon} /></div>
                            <h2 className="ftd-section-title">{section.name}</h2>
                            <span className="ftd-section-count">{Object.keys(section.groups).length} groups</span>
                        </div>

                        {Object.entries(section.groups).map(([groupName, groupTokens]) => (
                            <div key={groupName} className="ftd-semantic-group">
                                <div className="ftd-semantic-group-header">
                                    <h3 className="ftd-semantic-group-name">
                                        {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
                                    </h3>
                                    <span className="ftd-semantic-group-count">{groupTokens.length} tokens</span>
                                </div>

                                <div className="ftd-token-grid">
                                    {groupTokens.map((token) => {
                                        const isAlias = token.value.startsWith('{');
                                        const isColor = token.type === 'color';
                                        
                                        if (isColor) {
                                            const bgColor = token.resolvedValue || token.value;
                                            const textColor = getContrastColor(bgColor);
                                            
                                            return (
                                                <div
                                                    key={token.name}
                                                    className="ftd-token-card"
                                                    data-token-name={token.name}
                                                    data-token-css-var={token.cssVariable}
                                                    onClick={() => handleCopy(token)}
                                                >
                                                    <div className="ftd-token-swatch" style={{ backgroundColor: bgColor, color: textColor }}>
                                                        {isAlias && <span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.8 }}>Alias</span>}
                                                    </div>
                                                    <div className="ftd-token-info">
                                                        <p className="ftd-token-name">{token.name.split('.').pop()}</p>
                                                        <div className="ftd-token-values-row">
                                                            <span className="ftd-token-css-var">{token.cssVariable}</span>
                                                            <span className="ftd-token-hex">
                                                                {isAlias ? token.resolvedValue?.substring(0, 9) : token.value.substring(0, 9)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        
                                        return (
                                            <div
                                                key={token.name}
                                                className="ftd-token-card"
                                                data-token-name={token.name}
                                                data-token-css-var={token.cssVariable}
                                                onClick={() => handleCopy(token)}
                                            >
                                                <div className="ftd-token-info">
                                                    <p className="ftd-token-name">{token.name.split('.').pop()}</p>
                                                    <div className="ftd-token-values-row">
                                                        <span className="ftd-token-css-var">{token.cssVariable}</span>
                                                        <span className="ftd-token-hex">{token.resolvedValue}</span>
                                                    </div>
                                                    {isAlias && (
                                                        <span className="ftd-token-alias-badge">Alias: {token.value}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {copiedToast &&
                    (typeof document !== 'undefined'
                        ? createPortal(
                            <div className="ftd-copied-toast" role="status" aria-live="polite" key={copiedToast.id}>
                                <div className="ftd-toast-icon">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div className="ftd-toast-content">
                                    <span className="ftd-toast-label">Copied</span>
                                    <span className="ftd-toast-value">{copiedToast.value}</span>
                                </div>
                            </div>,
                            document.body
                        )
                        : null)}
            </div>
        </div>
    );
}

export default ComponentsTab;
