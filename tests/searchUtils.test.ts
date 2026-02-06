import { describe, it, expect } from 'vitest';
import { searchTokens, indexTokens, highlightMatch } from '../src/utils/searchUtils';

describe('Search Utils', () => {
    const mockTokens: any = {
        "Foundation/Value": {
            "base": {
                "blue": {
                    "500": { "value": "#3b82f6", "type": "color" }
                },
                "space": {
                    "md": { "value": "16px", "type": "dimension" }
                }
            }
        },
        "Semantic/Value": {
            "fill": {
                "primary": { "value": "{base.blue.500}", "type": "color" }
            }
        }
    };

    describe('indexTokens', () => {
        it('should correctly index all token types', () => {
            const indexed = indexTokens(mockTokens);
            expect(indexed.length).toBe(3);
            expect(indexed.find(t => t.name === 'blue-500')).toBeDefined();
            expect(indexed.find(t => t.name === 'fill-primary')).toBeDefined();
        });
    });

    describe('searchTokens', () => {
        const indexed = indexTokens(mockTokens);

        it('should find tokens by exact name', () => {
            const results = searchTokens('blue-500', indexed);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].token.name).toBe('blue-500');
        });

        it('should find tokens by partial name (fuzzy)', () => {
            const results = searchTokens('primary', indexed);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].token.name).toBe('fill-primary');
        });

        it('should find tokens by value', () => {
            const results = searchTokens('16px', indexed);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].token.name).toBe('space-md');
        });

        it('should return empty array for no matches', () => {
            const results = searchTokens('xyz123', indexed);
            expect(results.length).toBe(0);
        });
    });

    describe('highlightMatch', () => {
        it('should wrap matches in <mark> tags', () => {
            expect(highlightMatch('primary color', 'primary')).toBe('<mark>primary</mark> color');
            expect(highlightMatch('blue-500', '500')).toBe('blue-<mark>500</mark>');
        });

        it('should be case insensitive', () => {
            expect(highlightMatch('Background', 'back')).toBe('<mark>Back</mark>ground');
        });
    });
});
