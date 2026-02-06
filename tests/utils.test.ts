import { describe, it, expect } from 'vitest';
import { 
    isTokenValue, 
    parseNumericValue, 
    toCssVariable, 
    getContrastColor, 
    resolveTokenValue,
    createTokenMap
} from '../src/utils';

describe('Core Utils', () => {
    describe('isTokenValue', () => {
        it('should correctly identify token objects', () => {
            expect(isTokenValue({ value: '#fff', type: 'color' })).toBe(true);
            expect(isTokenValue({ value: 16, type: 'dimension' })).toBe(true);
            expect(isTokenValue({ something: 'else' })).toBe(false);
            expect(isTokenValue(null)).toBe(false);
        });
    });

    describe('parseNumericValue', () => {
        it('should extract numbers from strings', () => {
            expect(parseNumericValue('16px')).toBe(16);
            expect(parseNumericValue('1.5rem')).toBe(1.5);
            expect(parseNumericValue('-4px')).toBe(-4);
            expect(parseNumericValue('0')).toBe(0);
            expect(parseNumericValue(24 as any)).toBe(24);
        });
    });

    describe('toCssVariable', () => {
        it('should format paths correctly', () => {
            expect(toCssVariable('base/blue/50')).toBe('--base-blue-50');
            expect(toCssVariable('blue.50')).toBe('--blue-50');
            expect(toCssVariable('Brand Primary Color')).toBe('--brand-primary-color');
            expect(toCssVariable('spacing.md', 'ftd')).toBe('--ftd-spacing-md');
        });
    });

    describe('getContrastColor', () => {
        it('should return white for dark backgrounds and black for light backgrounds', () => {
            expect(getContrastColor('#000000')).toBe('white'); // Black
            expect(getContrastColor('#ffffff')).toBe('black'); // White
            expect(getContrastColor('#3b82f6')).toBe('white'); // Primary Blue
            expect(getContrastColor('#facc15')).toBe('black'); // Bright Yellow
        });

        it('should handle 3-char hex codes', () => {
            expect(getContrastColor('#000')).toBe('white');
            expect(getContrastColor('#fff')).toBe('black');
        });
    });

    describe('Token Resolution', () => {
        const tokenMap = {
            'base.blue.50': '#eff6ff',
            'base.blue.500': '#3b82f6',
            'semantic.primary': '{base.blue.500}',
            'component.button.bg': '{semantic.primary}',
            'deep.alias': '{component.button.bg}'
        };

        it('should resolve direct aliases', () => {
            expect(resolveTokenValue('{base.blue.500}', tokenMap)).toBe('#3b82f6');
        });

        it('should resolve multi-level aliases', () => {
            expect(resolveTokenValue('{component.button.bg}', tokenMap)).toBe('#3b82f6');
            expect(resolveTokenValue('{deep.alias}', tokenMap)).toBe('#3b82f6');
        });

        it('should return raw value if not an alias', () => {
            expect(resolveTokenValue('#ffffff', tokenMap)).toBe('#ffffff');
            expect(resolveTokenValue('16px', tokenMap)).toBe('16px');
        });

        it('should handle broken aliases gracefully', () => {
            expect(resolveTokenValue('{non.existent}', tokenMap)).toBe('{non.existent}');
        });
    });
});
