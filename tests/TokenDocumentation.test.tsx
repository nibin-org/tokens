import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { axe, toHaveNoViolations } from 'vitest-axe';
import { TokenDocumentation } from '../src/components/TokenDocumentation';

describe('TokenDocumentation Component', () => {
    const mockTokens: any = {
        "Foundation/Value": {
            "base": {
                "blue": {
                    "500": { "value": "#3b82f6", "type": "color" }
                }
            }
        }
    };
    const nestedFoundationTokens: any = {
        "Foundation/Value": {
            "base": {
                "color": {
                    "blue": {
                        "500": { "value": "#2563EB", "type": "color" },
                        "600": { "value": "#1D4ED8", "type": "color" }
                    },
                    "gray": {
                        "100": { "value": "#F3F4F6", "type": "color" },
                        "900": { "value": "#111827", "type": "color" }
                    }
                },
                "spacing": {
                    "xs": { "value": "4px", "type": "spacing" }
                },
                "sizing": {
                    "md": { "value": "40px", "type": "sizing" }
                },
                "borderRadius": {
                    "sm": { "value": "6px", "type": "borderRadius" },
                    "md": { "value": "10px", "type": "borderRadius" }
                }
            }
        }
    };
    const arbitraryNamedFoundationTokens: any = {
        "Foundation/Value": {
            "base": {
                "primitives-v2": {
                    "palette": {
                        "brand": {
                            "500": { "value": "#2563EB", "type": "color" },
                            "600": { "value": "#1D4ED8", "type": "color" }
                        }
                    },
                    "layout-scale": {
                        "compact": { "value": "8px", "type": "spacing" },
                        "cozy": { "value": "16px", "type": "spacing" }
                    },
                    "box-metrics": {
                        "card": { "value": "40px", "type": "sizing" }
                    },
                    "shape-language": {
                        "soft": { "value": "10px", "type": "borderRadius" }
                    }
                }
            }
        }
    };

    it('should render the title and subtitle', () => {
        render(
            <TokenDocumentation
                tokens={mockTokens}
                title="Test Title"
                subtitle="Test Subtitle"
            />
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should open search modal when search button is clicked', () => {
        render(<TokenDocumentation tokens={mockTokens} />);

        const searchButton = screen.getByTitle(/Search tokens/i);
        fireEvent.click(searchButton);

        // Search input should appear in the modal
        expect(screen.getByPlaceholderText(/Search tokens\.\.\./i)).toBeInTheDocument();
    });

    it('should open export modal when export button is clicked', () => {
        render(<TokenDocumentation tokens={mockTokens} />);

        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);

        // Export title should appear
        expect(screen.getByText('Export Tokens')).toBeInTheDocument();
        expect(screen.getByText(/Generate and download code snippets/i)).toBeInTheDocument();
    });

    it('should render base color families and border radius from Foundation/Value.base', async () => {
        render(<TokenDocumentation tokens={nestedFoundationTokens} />);

        expect(await screen.findByText('Base Colors')).toBeInTheDocument();
        expect(screen.getByText('blue')).toBeInTheDocument();
        expect(screen.getByText('gray')).toBeInTheDocument();
        expect(screen.getByText('Border Radius')).toBeInTheDocument();
    });

    it('should render foundation sections even when token group names are arbitrary', async () => {
        render(<TokenDocumentation tokens={arbitraryNamedFoundationTokens} />);

        expect(await screen.findByText('Base Colors')).toBeInTheDocument();
        expect(screen.getByText('primitives-v2-brand')).toBeInTheDocument();
        expect(screen.getByText('Spacing Scale')).toBeInTheDocument();
        expect(screen.getByText('Size Scale')).toBeInTheDocument();
        expect(screen.getByText('Border Radius')).toBeInTheDocument();
    });

    it('should toggle dark mode theme', () => {
        const { container } = render(<TokenDocumentation tokens={mockTokens} />);
        const ftdContainer = container.querySelector('.ftd-container');

        const themeToggle = screen.getByTitle(/Switch to dark mode/i) || screen.getByTitle(/Switch to light mode/i);

        // Initially light or default (assuming light for this test)
        expect(ftdContainer).toHaveAttribute('data-theme', 'light');

        fireEvent.click(themeToggle);
        expect(ftdContainer).toHaveAttribute('data-theme', 'dark');

        fireEvent.click(themeToggle);
        expect(ftdContainer).toHaveAttribute('data-theme', 'light');
    });

    describe('Accessibility', () => {
        it('should have no basic accessibility violations', async () => {
            const { container } = render(<TokenDocumentation tokens={mockTokens} />);
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should have accessible interactive elements', () => {
            render(<TokenDocumentation tokens={mockTokens} />);
            expect(screen.getByTitle(/Search tokens/i)).toHaveAttribute('aria-label', 'Search tokens');
            expect(screen.getByRole('button', { name: /Export/i })).toHaveAttribute('type', 'button');
        });
    });

    describe('Mobile Layout', () => {
        it('should adapt to small viewports', () => {
            // Mock window width
            global.innerWidth = 375;
            global.dispatchEvent(new Event('resize'));

            render(<TokenDocumentation tokens={mockTokens} />);

            // On mobile, certain elements might change or be hidden/visible
            // Just verifying it renders without crashing in "mobile mode"
            expect(screen.getByText(/Design Tokens/i)).toBeInTheDocument();
        });
    });
});
