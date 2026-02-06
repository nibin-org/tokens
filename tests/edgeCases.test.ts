import { describe, it, expect } from 'vitest';
import { indexTokens, searchTokens } from '../src/utils/searchUtils';
import { generateCSS } from '../src/utils/exportUtils';
import { createTokenMap, resolveTokenValue } from '../src/utils';

describe('Panic Tests (Broken Data)', () => {
    it('should handle empty token object without crashing', () => {
        const empty: any = {};
        expect(() => indexTokens(empty)).not.toThrow();
        expect(indexTokens(empty)).toEqual([]);
    });

    it('should handle missing categories in tokens', () => {
        const partial: any = { "Foundation/Value": {} };
        expect(() => indexTokens(partial)).not.toThrow();
        expect(generateCSS(partial)).toContain(':root {\n}');
    });

    it('should handle null or undefined values gracefully', () => {
        const broken: any = {
            "Foundation/Value": {
                "base": {
                    "color": { "50": null }
                }
            }
        };
        expect(() => indexTokens(broken)).not.toThrow();
        expect(createTokenMap(broken)).toEqual({});
    });

    it('should survive circular aliases', () => {
        const circular = {
            'a': '{b}',
            'b': '{a}'
        };
        // resolveTokenValue has a maxDepth of 10
        const result = resolveTokenValue('{a}', circular);
        expect(result).toBe('{a}'); // Should stop after maxDepth
    });
});
