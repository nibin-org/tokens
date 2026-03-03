import { describe, expect, it } from 'vitest';
import {
    buildGitHubHistoryEndpoint,
    buildGitHubRawSourceUrl,
    createGitHubPreviewUrl,
    createGitHubSnapshotHistory,
} from '../src/utils';

describe('Snapshot History Utils', () => {
    it('builds a GitHub raw source URL', () => {
        const url = buildGitHubRawSourceUrl({
            owner: 'nibin-org',
            repo: 'tokvista',
            branch: 'main',
            path: 'tokens/design tokens.json',
        });

        expect(url).toBe('https://raw.githubusercontent.com/nibin-org/tokvista/main/tokens/design%20tokens.json');
    });

    it('builds a GitHub history endpoint', () => {
        const endpoint = buildGitHubHistoryEndpoint({
            owner: 'nibin-org',
            repo: 'tokvista',
            branch: 'release',
            path: '/tokens.json',
            perPage: 20,
        });

        expect(endpoint).toBe(
            'https://api.github.com/repos/nibin-org/tokvista/commits?path=tokens.json&sha=release&per_page=20'
        );
    });

    it('creates snapshot history options from GitHub config', () => {
        const options = createGitHubSnapshotHistory({
            owner: 'nibin-org',
            repo: 'tokvista',
            path: 'tokens.json',
            accessMode: 'preview',
            title: 'GitHub History',
        });

        expect(options.enabled).toBe(true);
        expect(options.accessMode).toBe('preview');
        expect(options.title).toBe('GitHub History');
        expect(options.sourceUrl).toBe('https://raw.githubusercontent.com/nibin-org/tokvista/main/tokens.json');
        expect(options.historyEndpoint).toContain('/repos/nibin-org/tokvista/commits?');
    });

    it('creates a preview URL with source query', () => {
        const preview = createGitHubPreviewUrl({
            owner: 'nibin-org',
            repo: 'tokvista',
            branch: 'main',
            path: 'tokens.json',
            previewBaseUrl: 'https://tokvista-demo.vercel.app/',
        });

        const url = new URL(preview);
        expect(url.origin).toBe('https://tokvista-demo.vercel.app');
        expect(url.searchParams.get('source')).toBe(
            'https://raw.githubusercontent.com/nibin-org/tokvista/main/tokens.json'
        );
    });
});
