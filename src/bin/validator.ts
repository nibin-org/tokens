import { detectTokenFormat } from '../utils/formatDetector';
import { normalizeTokenFormat } from '../utils/formatNormalizers';

interface ValidationIssue {
  type: 'error' | 'warning';
  path: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  totalTokens: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTokenLike(obj: unknown): obj is { value: unknown; type?: string } {
  return isRecord(obj) && 'value' in obj;
}

function isValidColor(value: string): boolean {
  return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(value) ||
    /^rgb\(/.test(value) || /^rgba\(/.test(value) ||
    /^hsl\(/.test(value) || /^hsla\(/.test(value) ||
    value === 'transparent' || value === 'currentColor';
}

function isValidDimension(value: string): boolean {
  return /^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/.test(value) || value === '0';
}

function buildTokenMap(tokens: unknown): Set<string> {
  const tokenPaths = new Set<string>();

  function walk(node: unknown, path: string[] = []) {
    if (!isRecord(node)) return;

    // Skip Token Studio category wrappers at root level
    if (path.length === 0 && Object.keys(node).some(k => k.includes('/'))) {
      Object.values(node).forEach(val => walk(val, []));
      return;
    }

    if (isTokenLike(node)) {
      tokenPaths.add(path.join('.'));
      return;
    }

    Object.entries(node).forEach(([key, val]) => {
      walk(val, [...path, key]);
    });
  }

  walk(tokens);
  return tokenPaths;
}

export function validateTokens(tokens: unknown): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  let totalTokens = 0;
  const allAliases: Array<{ tokenPath: string; reference: string }> = [];

  if (!isRecord(tokens)) {
    return {
      valid: false,
      errors: [{ type: 'error', path: 'root', message: 'Token file must be a JSON object' }],
      warnings: [],
      totalTokens: 0
    };
  }

  // Detect and normalize format first
  const detection = detectTokenFormat(tokens);
  let normalizedTokens = tokens;
  
  if (detection.format !== 'token-studio' && detection.format !== 'unknown') {
    normalizedTokens = normalizeTokenFormat(tokens, detection.format);
  }

  function walk(node: unknown, path: string[] = []) {
    if (!isRecord(node)) return;

    // Skip Token Studio category wrappers at root level
    if (path.length === 0 && Object.keys(node).some(k => k.includes('/'))) {
      Object.values(node).forEach(val => walk(val, []));
      return;
    }

    if (isTokenLike(node)) {
      totalTokens++;
      const tokenPath = path.join('.');

      if (!node.type) {
        warnings.push({
          type: 'warning',
          path: tokenPath,
          message: 'Missing type field'
        });
      }

      if (node.value === null || node.value === undefined) {
        errors.push({
          type: 'error',
          path: tokenPath,
          message: 'Token value is null or undefined'
        });
        return;
      }

      const value = String(node.value);

      // Check for alias
      if (value.match(/^\{(.+)\}$/)) {
        allAliases.push({ tokenPath, reference: value });
      }

      // Validate color tokens
      if (node.type === 'color' && !value.startsWith('{')) {
        if (!isValidColor(value)) {
          errors.push({
            type: 'error',
            path: tokenPath,
            message: `Invalid color value: "${value}"`
          });
        }
      }

      // Validate dimension tokens
      if (['spacing', 'sizing', 'borderRadius', 'borderWidth'].includes(node.type || '')) {
        if (!value.startsWith('{') && !isValidDimension(value)) {
          errors.push({
            type: 'error',
            path: tokenPath,
            message: `Invalid dimension value: "${value}"`
          });
        }
      }

      return;
    }

    Object.entries(node).forEach(([key, val]) => {
      walk(val, [...path, key]);
    });
  }

  walk(normalizedTokens);

  // Build token map for alias validation
  const definedTokens = buildTokenMap(normalizedTokens);

  // Check for broken aliases
  allAliases.forEach(({ tokenPath, reference }) => {
    const refPath = reference.slice(1, -1);
    
    if (!definedTokens.has(refPath)) {
      errors.push({
        type: 'error',
        path: tokenPath,
        message: `References missing token: ${reference}`
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalTokens
  };
}
