import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Colors, Spacing, Sizes, Radius } from '../src/components/StandaloneComponents';

describe('Standalone Components', () => {
    const mockTokens: any = {
        "Foundation/Value": {
            base: {
                color: {
                    blue: {
                        "500": { value: "#3b82f6", type: "color" }
                    }
                },
                spacing: {
                    "md": { value: "16px", type: "spacing" }
                },
                sizing: {
                    "lg": { value: "32px", type: "sizing" }
                },
                borderRadius: {
                    "sm": { value: "4px", type: "borderRadius" }
                }
            }
        }
    };

    it('should render Colors standalone component', () => {
        render(<Colors tokens={mockTokens} title="Custom Colors" />);
        expect(screen.getByText('Custom Colors')).toBeInTheDocument();
        expect(screen.getByText('blue')).toBeInTheDocument();
    });

    it('should render Spacing standalone component', () => {
        render(<Spacing tokens={mockTokens} title="Custom Spacing" />);
        expect(screen.getByText('Custom Spacing')).toBeInTheDocument();
        expect(screen.getByText('md')).toBeInTheDocument();
    });

    it('should render Sizes standalone component', () => {
        render(<Sizes tokens={mockTokens} title="Custom Sizes" />);
        expect(screen.getByText('Custom Sizes')).toBeInTheDocument();
        // Use getAllByText and check for at least one since SizeScale renders both preview and list
        expect(screen.getAllByText('lg').length).toBeGreaterThan(0);
    });

    it('should render Radius standalone component', () => {
        render(<Radius tokens={mockTokens} title="Custom Radius" />);
        expect(screen.getByText('Custom Radius')).toBeInTheDocument();
        expect(screen.getByText('sm')).toBeInTheDocument();
    });
});
