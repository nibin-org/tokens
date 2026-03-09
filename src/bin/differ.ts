import { detectTokenFormat } from '../utils/formatDetector';
import { normalizeTokenFormat } from '../utils/formatNormalizers';

interface TokenDiff {
  added: string[];
  removed: string[];
  modified: Array<{ path: string; oldValue: string; newValue: string }>;
  unchanged: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTokenLike(obj: unknown): obj is { value: unknown; type?: string } {
  return isRecord(obj) && 'value' in obj;
}

function flattenTokens(tokens: unknown): Map<string, string> {
  const flat = new Map<string, string>();

  function walk(node: unknown, path: string[] = []) {
    if (!isRecord(node)) return;

    if (path.length === 0 && Object.keys(node).some(k => k.includes('/'))) {
      Object.values(node).forEach(val => walk(val, []));
      return;
    }

    if (isTokenLike(node)) {
      flat.set(path.join('.'), String(node.value));
      return;
    }

    Object.entries(node).forEach(([key, val]) => {
      walk(val, [...path, key]);
    });
  }

  walk(tokens);
  return flat;
}

export function diffTokens(oldTokens: unknown, newTokens: unknown): TokenDiff {
  const oldDetection = detectTokenFormat(oldTokens);
  const newDetection = detectTokenFormat(newTokens);

  let normalizedOld = oldTokens;
  let normalizedNew = newTokens;

  if (oldDetection.format !== 'token-studio' && oldDetection.format !== 'unknown') {
    normalizedOld = normalizeTokenFormat(oldTokens, oldDetection.format);
  }

  if (newDetection.format !== 'token-studio' && newDetection.format !== 'unknown') {
    normalizedNew = normalizeTokenFormat(newTokens, newDetection.format);
  }

  const oldFlat = flattenTokens(normalizedOld);
  const newFlat = flattenTokens(normalizedNew);

  const added: string[] = [];
  const removed: string[] = [];
  const modified: Array<{ path: string; oldValue: string; newValue: string }> = [];
  let unchanged = 0;

  // Find added and modified
  newFlat.forEach((newValue, path) => {
    if (!oldFlat.has(path)) {
      added.push(path);
    } else if (oldFlat.get(path) !== newValue) {
      modified.push({ path, oldValue: oldFlat.get(path)!, newValue });
    } else {
      unchanged++;
    }
  });

  // Find removed
  oldFlat.forEach((_, path) => {
    if (!newFlat.has(path)) {
      removed.push(path);
    }
  });

  return { added, removed, modified, unchanged };
}
