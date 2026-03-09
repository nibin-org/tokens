/**
 * Format normalizers - transform various token formats to Token Studio format
 */

import type { TokenFormat } from './formatDetector';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Normalize W3C format ($type, $value) to Token Studio format (type, value)
 */
function normalizeW3C(data: Record<string, unknown>): Record<string, unknown> {
  const normalize = (obj: unknown): unknown => {
    if (!isRecord(obj)) return obj;
    
    // If this is a W3C token, convert it
    if ('$value' in obj && '$type' in obj) {
      const result: Record<string, unknown> = {
        value: obj.$value,
        type: obj.$type,
      };
      if (obj.$description) {
        result.description = obj.$description;
      }
      return result;
    }
    
    // Recursively normalize nested objects
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$') && !['$value', '$type', '$description'].includes(key)) {
        // Preserve metadata keys like $schemaVersion
        result[key] = value;
      } else if (!key.startsWith('$')) {
        result[key] = normalize(value);
      }
    }
    return result;
  };
  
  return normalize(data) as Record<string, unknown>;
}

/**
 * Normalize Style Dictionary flat format to nested Token Studio format
 */
function normalizeStyleDictionary(data: Record<string, unknown>): Record<string, unknown> {
  const tokens: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    
    // Parse CSS variable or SCSS variable name
    let cleanKey = key;
    if (key.startsWith('--')) cleanKey = key.slice(2);
    if (key.startsWith('$')) cleanKey = key.slice(1);
    
    // Split into path parts
    const parts = cleanKey.split('-').filter(Boolean);
    if (parts.length === 0) continue;
    
    // Determine type from value or key
    let type = 'string';
    const valueStr = String(value);
    if (valueStr.match(/^#[0-9a-f]{3,8}$/i) || valueStr.match(/^rgba?\(/i)) {
      type = 'color';
    } else if (valueStr.match(/^\d+px$/)) {
      if (parts.some(p => p.includes('space') || p.includes('spacing') || p.includes('gap'))) {
        type = 'spacing';
      } else if (parts.some(p => p.includes('radius') || p.includes('round'))) {
        type = 'borderRadius';
      } else if (parts.some(p => p.includes('size') || p.includes('width') || p.includes('height'))) {
        type = 'sizing';
      } else {
        type = 'dimension';
      }
    } else if (valueStr.match(/^\d+$/)) {
      type = 'number';
    }
    
    // Build nested structure
    let current = tokens;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) current[part] = {};
      current = current[part] as Record<string, unknown>;
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = { type, value };
  }
  
  return { tokens };
}

/**
 * Normalize Supernova format to Token Studio format
 */
function normalizeSupernova(data: unknown): Record<string, unknown> {
  const tokenArray = Array.isArray(data) ? data : (isRecord(data) && Array.isArray(data.tokens) ? data.tokens : []);
  
  const tokens: Record<string, unknown> = {};
  
  for (const token of tokenArray) {
    if (!isRecord(token)) continue;
    
    const id = token.id as string;
    const name = (token.name || id) as string;
    const tokenValue = token.value;
    const tokenType = (token.tokenType || token.type || 'string') as string;
    const category = token.category as string | undefined;
    
    if (!name || tokenValue === undefined) continue;
    
    // Extract actual value from Supernova value object
    let value: unknown = tokenValue;
    if (isRecord(tokenValue)) {
      if ('hex' in tokenValue) value = tokenValue.hex;
      else if ('measure' in tokenValue && 'unit' in tokenValue) {
        value = `${tokenValue.measure}${tokenValue.unit}`;
      }
    }
    
    // Map Supernova types to token types
    let type = 'string';
    if (tokenType === 'Color') type = 'color';
    else if (tokenType === 'Dimension') type = 'dimension';
    else if (tokenType === 'Number') type = 'number';
    else type = tokenType.toLowerCase();
    
    // Build path from category and name
    const pathParts: string[] = [];
    if (category) pathParts.push(category);
    pathParts.push(...name.split('/').filter(Boolean));
    
    if (pathParts.length === 0) continue;
    
    // Build nested structure
    let current = tokens;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) current[part] = {};
      current = current[part] as Record<string, unknown>;
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = { type, value };
  }
  
  return tokens;
}

/**
 * Normalize Figma REST API format to Token Studio format
 */
function normalizeFigmaAPI(data: Record<string, unknown>): Record<string, unknown> {
  // Check for meta.variables structure
  if ('meta' in data && isRecord(data.meta)) {
    const meta = data.meta;
    if ('variables' in meta && isRecord(meta.variables)) {
      const tokens: Record<string, unknown> = {};
      
      for (const [key, variable] of Object.entries(meta.variables)) {
        if (!isRecord(variable)) continue;
        
        const name = (variable.name || key) as string;
        const resolvedType = variable.resolvedType as string;
        const valuesByMode = variable.valuesByMode;
        
        if (!name || !valuesByMode || !isRecord(valuesByMode)) continue;
        
        // Get first mode value
        const firstModeValue = Object.values(valuesByMode)[0];
        
        // Map Figma types to token types
        let type = 'string';
        if (resolvedType === 'COLOR') type = 'color';
        else if (resolvedType === 'FLOAT') type = 'number';
        else if (resolvedType === 'STRING') type = 'string';
        
        // Parse name into path
        const parts = name.split('/').filter(Boolean);
        if (parts.length === 0) continue;
        
        // Build nested structure
        let current = tokens;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) current[part] = {};
          current = current[part] as Record<string, unknown>;
        }
        
        const lastPart = parts[parts.length - 1];
        current[lastPart] = { type, value: firstModeValue };
      }
      
      return { tokens };
    }
  }
  
  return data;
}

/**
 * Main normalizer - detects format and normalizes to Token Studio format
 */
export function normalizeTokenFormat(
  data: unknown,
  detectedFormat: TokenFormat
): Record<string, unknown> {
  if (!isRecord(data) && !Array.isArray(data)) return {};
  
  switch (detectedFormat) {
    case 'w3c':
      return isRecord(data) ? normalizeW3C(data) : {};
    
    case 'style-dictionary':
      return isRecord(data) ? normalizeStyleDictionary(data) : {};
    
    case 'supernova':
      return normalizeSupernova(data);
    
    case 'figma-api':
      return isRecord(data) ? normalizeFigmaAPI(data) : {};
    
    case 'token-studio':
    case 'unknown':
    default:
      return isRecord(data) ? data : {};
  }
}
