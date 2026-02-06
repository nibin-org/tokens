'use client';

import React, { useMemo } from 'react';
import type { StandaloneTokenProps } from '../types';
import { ColorGrid } from './ColorGrid';
import { SpacingScale } from './SpacingScale';
import { SizeScale } from './SizeScale';
import { RadiusShowcase } from './RadiusShowcase';
import { createTokenMap } from '../utils';

/**
 * Spacing - Standalone component to display spacing tokens
 */
export function Spacing({ tokens, onTokenClick, title }: StandaloneTokenProps) {
    const spacingData = useMemo(() => {
        const foundation = tokens["Foundation/Value"]?.base || tokens["Foundation/Value"] || tokens.global || tokens;
        return foundation.spacing || foundation.space || {};
    }, [tokens]);

    return (
        <div className="ftd-standalone">
            {title && <h2 className="ftd-standalone-title">{title}</h2>}
            <SpacingScale tokens={spacingData} onTokenClick={onTokenClick} />
        </div>
    );
}

/**
 * Colors - Standalone component to display color tokens
 */
export function Colors({ tokens, onTokenClick, title }: StandaloneTokenProps) {
    const { base, fill, stroke, text } = useMemo(() => {
        const foundation = tokens["Foundation/Value"]?.base || tokens["Foundation/Value"] || tokens.global || tokens;
        const semantic = tokens["Semantic/Value"] || {};

        return {
            base: foundation.color || foundation.colors || {},
            fill: semantic.fill || {},
            stroke: semantic.stroke || {},
            text: semantic.text || {}
        };
    }, [tokens]);

    const tokenMap = useMemo(() => createTokenMap(tokens), [tokens]);

    return (
        <div className="ftd-standalone">
            {title && <h2 className="ftd-standalone-title">{title}</h2>}
            <ColorGrid
                baseColors={base}
                fillColors={fill}
                strokeColors={stroke}
                textColors={text}
                tokenMap={tokenMap}
                onColorClick={onTokenClick}
            />
        </div>
    );
}

/**
 * Sizes - Standalone component to display sizing tokens
 */
export function Sizes({ tokens, onTokenClick, title }: StandaloneTokenProps) {
    const sizingData = useMemo(() => {
        const foundation = tokens["Foundation/Value"]?.base || tokens["Foundation/Value"] || tokens.global || tokens;
        return foundation.sizing || foundation.size || {};
    }, [tokens]);

    return (
        <div className="ftd-standalone">
            {title && <h2 className="ftd-standalone-title">{title}</h2>}
            <SizeScale tokens={sizingData} onTokenClick={onTokenClick} />
        </div>
    );
}

/**
 * Radius - Standalone component to display border radius tokens
 */
export function Radius({ tokens, onTokenClick, title }: StandaloneTokenProps) {
    const radiusData = useMemo(() => {
        const foundation = tokens["Foundation/Value"]?.base || tokens["Foundation/Value"] || tokens.global || tokens;
        return foundation.borderRadius || foundation.radius || {};
    }, [tokens]);

    return (
        <div className="ftd-standalone">
            {title && <h2 className="ftd-standalone-title">{title}</h2>}
            <RadiusShowcase tokens={radiusData} onTokenClick={onTokenClick} />
        </div>
    );
}
