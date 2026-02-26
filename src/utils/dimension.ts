import type { NestedTokens, ParsedSpacingToken, ParsedRadiusToken, ParsedSizeToken } from '../types';
import { findAllTokens, toCssVariable, parseNumericValue } from './core';

/**
 * Generic parser for dimension tokens
 */
function parseDimensionTokens<T>(
  tokens: NestedTokens, 
  type: string, 
  mapFn: (name: string, value: string, cssVar: string, numeric: number) => T
): T[] {
  const allTokens = findAllTokens(tokens);
  return allTokens
    .filter(t => t.token.type === type || t.token.type === 'dimension')
    .map(({ path, token }) => {
      const value = typeof token.value === 'string' ? token.value : String(token.value);
      return mapFn(
        path,
        value,
        toCssVariable(path),
        parseNumericValue(value)
      );
    });
}

/**
 * Parse spacing tokens
 */
export function parseSpacingTokens(tokens: NestedTokens): ParsedSpacingToken[] {
  const result = parseDimensionTokens<ParsedSpacingToken>(
    tokens, 
    'spacing', 
    (name, value, cssVariable, numericValue) => ({ name, value, cssVariable, numericValue })
  );
  return result.sort((a, b) => a.numericValue - b.numericValue);
}

/**
 * Parse radius tokens
 */
export function parseRadiusTokens(tokens: NestedTokens): ParsedRadiusToken[] {
  const result = parseDimensionTokens<ParsedRadiusToken>(
    tokens, 
    'borderRadius', 
    (name, value, cssVariable, numericValue) => ({ name, value, cssVariable, numericValue })
  );
  return result.sort((a, b) => a.numericValue - b.numericValue);
}

/**
 * Parse size tokens
 */
export function parseSizeTokens(tokens: NestedTokens): ParsedSizeToken[] {
  const result = parseDimensionTokens<ParsedSizeToken>(
    tokens, 
    'sizing', 
    (name, value, cssVariable, numericValue) => ({ name, value, cssVariable, numericValue })
  );
  return result.sort((a, b) => a.numericValue - b.numericValue);
}
