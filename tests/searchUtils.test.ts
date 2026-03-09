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

    const nestedAndMergedTokens: any = {
        "Foundation/Value": {
            "base": {
                "color": {
                    "blue": {
                        "500": { "value": "#3b82f6", "type": "color" }
                    }
                }
            }
        },
        "Components/Mode 1": {
            "button": {
                "Primary": {
                    "base": { "value": "#0EA5E9", "type": "color" }
                }
            }
        },
        "Components/Mode 2": {
            "button": {
                "height": {
                    "md": { "value": "40px", "type": "dimension" }
                }
            }
        }
    };

    const foundationWithSiblingGroups: any = {
        "Foundation/Value": {
            "base": {
                "blue": {
                    "500": { "value": "#3b82f6", "type": "color" }
                },
                "spacing": {
                    "md": { "value": "16px", "type": "spacing" }
                }
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

        it('should index nested foundation and merged component sets', () => {
            const indexed = indexTokens(nestedAndMergedTokens);
            expect(indexed.find(t => t.name === 'color-blue-500')).toBeDefined();
            expect(indexed.find(t => t.name === 'button Primary base')).toBeDefined();
            expect(indexed.find(t => t.name === 'button height md')).toBeDefined();
        });

        it('should use token.type for component color typing', () => {
            const indexed = indexTokens(nestedAndMergedTokens);
            const token = indexed.find(t => t.name === 'button Primary base');
            expect(token?.type).toBe('color');
        });

        it('should include foundation siblings when base exists', () => {
            const indexed = indexTokens(foundationWithSiblingGroups);
            expect(indexed.find(t => t.name === 'blue-500')).toBeDefined();
            expect(indexed.find(t => t.name === 'spacing-md')).toBeDefined();
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
