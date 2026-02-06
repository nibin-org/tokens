import { describe, it, expect, beforeEach } from 'vitest';
import { generateCSS, generateSCSS, generateJS, generateTailwind } from '../src/utils/exportUtils';
import { FigmaTokens } from '../src/types';

describe('Export Utils', () => {
    const mockTokens: any = {
        "Foundation/Value": {
            "base": {
                "blue": {
                    "50": { "value": "#3b82f6", "type": "color" }
                },
                "space": {
                    "md": { "value": "16px", "type": "dimension" }
                }
            }
        },
        "Semantic/Value": {
            "fill": {
                "primary": { "value": "{base.blue.50}", "type": "color" }
            }
        }
    };

    describe('generateCSS', () => {
        it('should generate valid CSS variables with alias resolution', () => {
            const css = generateCSS(mockTokens);
            expect(css).toContain(':root {');
            expect(css).toContain('--base-blue-50: #3b82f6;');
            expect(css).toContain('--fill-primary: var(--base-blue-50);'); // Smart alias resolution
        });
    });

    describe('generateSCSS', () => {
        it('should generate valid SCSS variables and maps', () => {
            const scss = generateSCSS(mockTokens);
            expect(scss).toContain('$base-blue-50: #3b82f6;');
            expect(scss).toContain('$fill-primary: $base-blue-50;'); // Smart alias resolution
            expect(scss).toContain('$tokens: (');
            expect(scss).toContain('"base-blue-50": #3b82f6');
        });
    });

    describe('generateTailwind', () => {
        it('should generate valid Tailwind config extend object', () => {
            const tw = generateTailwind(mockTokens);
            expect(tw).toContain('"extend": {');
            expect(tw).toContain('"colors": {');
            expect(tw).toContain('"base-blue-50": "var(--base-blue-50)"');
            expect(tw).toContain('"fill-primary": "var(--fill-primary)"');
        });
    });

    describe('generateJS', () => {
        it('should generate valid JavaScript object string', () => {
            const js = generateJS(mockTokens);
            expect(js).toContain('export const tokens = {');
            expect(js).toContain('"base-blue-50": "#3b82f6"');
            expect(js).toContain('"fill-primary": "{base.blue.50}"'); // Raw for now
        });
    });
});
