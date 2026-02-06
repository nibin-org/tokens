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
