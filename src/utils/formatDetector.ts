/**
 * Token format detection and validation
 */

export type TokenFormat = 
  | 'token-studio'
  | 'w3c'
  | 'style-dictionary'
  | 'supernova'
  | 'figma-api'
  | 'unknown';

export interface FormatDetectionResult {
  format: TokenFormat;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasTokenShape(obj: unknown): boolean {
  if (!isRecord(obj)) return false;
  return ('value' in obj && 'type' in obj) || ('$value' in obj && '$type' in obj);
}

function countTokens(obj: unknown, maxDepth = 5, depth = 0): number {
  if (depth > maxDepth || !isRecord(obj)) return 0;
  if (hasTokenShape(obj)) return 1;
  
  let count = 0;
  for (const value of Object.values(obj)) {
    count += countTokens(value, maxDepth, depth + 1);
  }
  return count;
}

function detectStyleDictionary(data: Record<string, unknown>): { match: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Style Dictionary: flat CSS variable map like { "--color-primary": "#fff", "--spacing-sm": "8px" }
  const keys = Object.keys(data);
  if (keys.length === 0) return { match: false, issues };
  
  const cssVarKeys = keys.filter(k => k.startsWith('--') || k.startsWith('$'));
  const hasCssVars = cssVarKeys.length > keys.length * 0.5;
  
  if (hasCssVars) {
    const allStrings = Object.values(data).every(v => typeof v === 'string' || typeof v === 'number');
    if (allStrings) return { match: true, issues };
    issues.push('Style Dictionary format detected but some values are not primitives');
  }
  
  return { match: false, issues };
}

function detectSupernova(data: Record<string, unknown>): { match: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Supernova: has "tokens" array with id/name/value structure
  if ('tokens' in data && Array.isArray(data.tokens)) {
    const tokens = data.tokens as unknown[];
    if (tokens.length > 0) {
      const first = tokens[0];
      if (isRecord(first) && 'id' in first && 'name' in first && 'value' in first) {
        return { match: true, issues };
      }
      issues.push('Supernova format detected but tokens array has unexpected structure');
    }
  }
  
  return { match: false, issues };
}

function detectFigmaAPI(data: Record<string, unknown>): { match: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Figma REST API: has "meta.variables" or "nodes" structure
  if ('meta' in data && isRecord(data.meta)) {
    const meta = data.meta;
    if ('variables' in meta || 'variableCollections' in meta) {
      return { match: true, issues };
    }
  }
  
  if ('nodes' in data && isRecord(data.nodes)) {
    issues.push('Figma API response detected but needs variable extraction');
    return { match: true, issues };
  }
  
  return { match: false, issues };
}

function detectW3C(data: Record<string, unknown>): { match: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // W3C: uses $type and $value
  const tokenCount = countTokens(data);
  if (tokenCount === 0) return { match: false, issues };
  
  let w3cCount = 0;
  let totalChecked = 0;
  
  const checkW3C = (obj: unknown, depth = 0): void => {
    if (depth > 10 || !isRecord(obj)) return;
    
    if ('$value' in obj && '$type' in obj) {
      w3cCount++;
      totalChecked++;
      return;
    }
    
    if ('value' in obj && 'type' in obj) {
      totalChecked++;
      return;
    }
    
    for (const value of Object.values(obj)) {
      checkW3C(value, depth + 1);
    }
  };
  
  checkW3C(data);
  
  if (totalChecked > 0 && w3cCount > totalChecked * 0.5) {
    return { match: true, issues };
  }
  
  return { match: false, issues };
}

function detectTokenStudio(data: Record<string, unknown>): { match: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Token Studio: uses type and value (not $type/$value)
  const tokenCount = countTokens(data);
  if (tokenCount === 0) return { match: false, issues };
  
  let studioCount = 0;
  let totalChecked = 0;
  
  const checkStudio = (obj: unknown, depth = 0): void => {
    if (depth > 10 || !isRecord(obj)) return;
    
    if ('value' in obj && 'type' in obj && !('$value' in obj)) {
      studioCount++;
      totalChecked++;
      return;
    }
    
    if ('$value' in obj) {
      totalChecked++;
      return;
    }
    
    for (const value of Object.values(obj)) {
      checkStudio(value, depth + 1);
    }
  };
  
  checkStudio(data);
  
  if (totalChecked > 0 && studioCount > totalChecked * 0.5) {
    return { match: true, issues };
  }
  
  return { match: false, issues };
}

export function detectTokenFormat(input: unknown): FormatDetectionResult {
  // Handle array format (Supernova)
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return {
        format: 'unknown',
        confidence: 0,
        issues: ['Token array is empty'],
        suggestions: ['Add tokens to the array'],
      };
    }
    
    const first = input[0];
    if (isRecord(first) && 'id' in first && 'tokenType' in first && 'value' in first) {
      return { format: 'supernova', confidence: 0.95, issues: [], suggestions: [] };
    }
    
    return {
      format: 'unknown',
      confidence: 0,
      issues: ['Array format detected but structure is not recognized'],
      suggestions: ['Supernova format expects: [{ id, name, tokenType, value, category }]'],
    };
  }
  
  if (!isRecord(input)) {
    return {
      format: 'unknown',
      confidence: 0,
      issues: ['Input is not a valid JSON object or array'],
      suggestions: ['Ensure your token file contains a valid JSON object or array'],
    };
  }
  
  const data = input;
  const allIssues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for explicit format markers
  if ('$format' in data && typeof data.$format === 'string') {
    const format = data.$format.toLowerCase();
    if (format.includes('tokvista') || format.includes('token-studio')) {
      return { format: 'token-studio', confidence: 1, issues: [], suggestions: [] };
    }
  }
  
  // Try each format detector
  const figmaResult = detectFigmaAPI(data);
  if (figmaResult.match) {
    allIssues.push(...figmaResult.issues);
    suggestions.push('Extract variables from meta.variables or use Figma plugin export');
    return { format: 'figma-api', confidence: 0.9, issues: allIssues, suggestions };
  }
  
  const supernovaResult = detectSupernova(data);
  if (supernovaResult.match) {
    allIssues.push(...supernovaResult.issues);
    return { format: 'supernova', confidence: 0.9, issues: allIssues, suggestions };
  }
  
  const styleDictResult = detectStyleDictionary(data);
  if (styleDictResult.match) {
    allIssues.push(...styleDictResult.issues);
    return { format: 'style-dictionary', confidence: 0.85, issues: allIssues, suggestions };
  }
  
  const w3cResult = detectW3C(data);
  const studioResult = detectTokenStudio(data);
  
  if (w3cResult.match && studioResult.match) {
    // Both match, prefer Token Studio (more common)
    return { format: 'token-studio', confidence: 0.8, issues: [], suggestions: [] };
  }
  
  if (w3cResult.match) {
    return { format: 'w3c', confidence: 0.8, issues: [], suggestions: [] };
  }
  
  if (studioResult.match) {
    return { format: 'token-studio', confidence: 0.8, issues: [], suggestions: [] };
  }
  
  // Unknown format
  const tokenCount = countTokens(data);
  if (tokenCount === 0) {
    allIssues.push('No valid tokens found with {type, value} or {$type, $value} structure');
    suggestions.push('Tokens should have format: { "type": "color", "value": "#fff" }');
    suggestions.push('Or W3C format: { "$type": "color", "$value": "#fff" }');
  } else {
    allIssues.push(`Found ${tokenCount} potential tokens but format is unclear`);
    suggestions.push('Check that tokens have consistent {type, value} structure');
  }
  
  return { format: 'unknown', confidence: 0, issues: allIssues, suggestions };
}
