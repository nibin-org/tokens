import type {
  GitHubPreviewLinkConfig,
  GitHubSnapshotHistoryConfig,
  GitHubSnapshotProjectConfig,
  SnapshotHistoryOptions,
} from '../types';

function required(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`GitHub snapshot config requires "${name}".`);
  }
  return trimmed;
}

function normalizePath(path: string): string {
  const trimmed = required('path', path);
  return trimmed.replace(/^\/+/, '');
}

function encodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function getPerPage(perPage?: number): number {
  if (!perPage || Number.isNaN(perPage)) return 15;
  return Math.max(1, Math.min(Math.floor(perPage), 100));
}

export function buildGitHubRawSourceUrl(config: GitHubSnapshotProjectConfig): string {
  const owner = required('owner', config.owner);
  const repo = required('repo', config.repo);
  const branch = (config.branch || 'main').trim() || 'main';
  const path = encodePath(normalizePath(config.path));
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${path}`;
}

export function buildGitHubHistoryEndpoint(config: GitHubSnapshotProjectConfig): string {
  const owner = required('owner', config.owner);
  const repo = required('repo', config.repo);
  const branch = (config.branch || 'main').trim() || 'main';
  const path = normalizePath(config.path);
  const perPage = getPerPage(config.perPage);
  const params = new URLSearchParams({
    path,
    sha: branch,
    per_page: String(perPage),
  });
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${params.toString()}`;
}

export function createGitHubSnapshotHistory(config: GitHubSnapshotHistoryConfig): SnapshotHistoryOptions {
  return {
    enabled: true,
    accessMode: config.accessMode || 'full',
    historyEndpoint: buildGitHubHistoryEndpoint(config),
    sourceUrl: buildGitHubRawSourceUrl(config),
    title: config.title || 'Snapshot History',
  };
}

export function createGitHubPreviewUrl(config: GitHubPreviewLinkConfig): string {
  const base = required('previewBaseUrl', config.previewBaseUrl);
  const sourceUrl = buildGitHubRawSourceUrl(config);
  const previewUrl = new URL(base);
  previewUrl.searchParams.set('source', sourceUrl);
  return previewUrl.toString();
}
