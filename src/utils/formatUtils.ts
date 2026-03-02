import type { CopyFormat } from '../components/FormatSelector';
import { toCssVariable } from './core';

/**
 * Format a token path to the appropriate variable format for display
 */
export function formatTokenPath(path: string, format: CopyFormat): string {
    switch (format) {
        case 'css':
            return `var(${toCssVariable(path)})`;
        
        case 'scss':
            return `$${path.replace(/\./g, '-')}`;
        
        case 'tailwind':
            return path.replace(/\./g, '-');
        
        default:
            return `var(${toCssVariable(path)})`;
    }
}

/**
 * Format a token value based on the selected copy format
 */
export function formatTokenForCopy(
    value: string,
    tokenPath: string,
    format: CopyFormat
): string {
    // If value is already a resolved color/value (like #fff or 16px), return as-is for all formats
    if (!value.startsWith('{') && !value.startsWith('var(') && !value.startsWith('--')) {
        return value;
    }

    // Extract the token path from reference
    let path = tokenPath;
    if (value.startsWith('{') && value.endsWith('}')) {
        path = value.slice(1, -1);
    } else if (value.startsWith('var(--') && value.endsWith(')')) {
        path = value.slice(6, -1);
    } else if (value.startsWith('--')) {
        path = value.slice(2);
    }

    switch (format) {
        case 'css':
            return `var(${toCssVariable(path)})`;
        
        case 'scss':
            // Convert path to SCSS variable format: $token-name
            return `$${path.replace(/\./g, '-')}`;
        
        case 'tailwind':
            // Convert path to Tailwind class format: token-name
            return path.replace(/\./g, '-');
        
        default:
            return `var(${toCssVariable(path)})`;
    }
}

/**
 * Format a label for display in the copied toast
 */
export function formatCopiedLabel(
    label: string | undefined,
    value: string,
    format: CopyFormat
): string {
    const text = label || value;
    if (!text) return value;

    // Extract path from various formats
    let path = text;
    if (text.startsWith('var(--') && text.endsWith(')')) {
        path = text.slice(6, -1);
    } else if (text.startsWith('--')) {
        path = text.slice(2);
    } else if (text.startsWith('$')) {
        path = text.slice(1);
    } else if (text.startsWith('{') && text.endsWith('}')) {
        path = text.slice(1, -1);
    }

    return formatTokenPath(path, format);
}
