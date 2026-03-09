import { createTokenMap, resolveTokenValue, extractFoundationSet, extractSemanticSet, extractComponentSet } from './core';

export interface AnalyticsResult {
    total: number;
    foundation: number;
    semantic: number;
    components: number;
    byType: Record<string, { total: number; foundation: number; semantic: number; components: number }>;
    aliases: number;
    hardcoded: number;
    brokenAliases: Array<{ path: string; reference: string }>;
    hardcodedInSemantic: number;
    hardcodedInComponents: number;
    hardcodedSemanticPaths: string[];
    hardcodedComponentPaths: string[];
    otherTypes: Record<string, number>;
}

function isTokenLeaf(value: unknown): value is { type: string; value: unknown } {
    return typeof value === 'object' && value !== null && 'type' in value && 'value' in value;
}

function isAlias(value: unknown): boolean {
    return typeof value === 'string' && /^\{[^{}]+\}$/.test(value.trim());
}

function collectStats(
    obj: unknown,
    tokenMap: Record<string, string>,
    layer: 'foundation' | 'semantic' | 'components',
    path: string[] = [],
    stats: AnalyticsResult
): AnalyticsResult {
    if (!obj || typeof obj !== 'object') return stats;

    if (isTokenLeaf(obj)) {
        stats.total++;
        stats[layer]++;

        const type = obj.type || 'unknown';
        if (!stats.byType[type]) {
            stats.byType[type] = { total: 0, foundation: 0, semantic: 0, components: 0 };
        }
        stats.byType[type].total++;
        stats.byType[type][layer]++;

        if (type === 'unknown') {
            const rawType = String((obj as any).type || 'missing');
            stats.otherTypes[rawType] = (stats.otherTypes[rawType] || 0) + 1;
        }

        if (isAlias(obj.value)) {
            stats.aliases++;
            const resolved = resolveTokenValue(obj.value as string, tokenMap);
            if (resolved === obj.value) {
                stats.brokenAliases.push({ path: path.join('.'), reference: obj.value as string });
            }
        } else {
            stats.hardcoded++;
            if (layer === 'semantic') {
                stats.hardcodedInSemantic++;
                stats.hardcodedSemanticPaths.push(path.join('.'));
            }
            if (layer === 'components') {
                stats.hardcodedInComponents++;
                stats.hardcodedComponentPaths.push(path.join('.'));
            }
        }
        return stats;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, i) => collectStats(item, tokenMap, layer, [...path, String(i)], stats));
    } else {
        Object.entries(obj as Record<string, unknown>).forEach(([key, value]) =>
            collectStats(value, tokenMap, layer, [...path, key], stats)
        );
    }

    return stats;
}

export function analyzeTokens(tokens: unknown): AnalyticsResult {
    const tokenMap = createTokenMap(tokens);
    const foundation = extractFoundationSet(tokens);
    const semantic = extractSemanticSet(tokens);
    const components = extractComponentSet(tokens);

    const result: AnalyticsResult = {
        total: 0,
        foundation: 0,
        semantic: 0,
        components: 0,
        byType: {},
        aliases: 0,
        hardcoded: 0,
        brokenAliases: [],
        hardcodedInSemantic: 0,
        hardcodedInComponents: 0,
        hardcodedSemanticPaths: [],
        hardcodedComponentPaths: [],
        otherTypes: {},
    };

    collectStats(foundation, tokenMap, 'foundation', [], result);
    collectStats(semantic, tokenMap, 'semantic', [], result);
    collectStats(components, tokenMap, 'components', [], result);

    return result;
}
