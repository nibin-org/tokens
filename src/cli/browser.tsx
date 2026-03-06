import React from 'react';
import { createRoot } from 'react-dom/client';
import { TokenDocumentation } from '../components/TokenDocumentation';
import type { ThemeConfig, TokenCategory, TokvistaThemePreference } from '../types';

type CliRuntimeConfig = {
  title?: string;
  subtitle?: string;
  logo?: string;
  theme?: TokvistaThemePreference;
  brandColor?: string;
  categories?: string[];
  defaultTab?: string;
  showSearch?: boolean;
};

declare global {
  interface Window {
    __TOKVISTA_TOKENS__?: unknown;
    __TOKVISTA_CONFIG__?: unknown;
  }
}

function getSystemThemeMode(): 'light' | 'dark' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function normalizeCategories(input: unknown): TokenCategory[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const allowed: TokenCategory[] = ['foundation', 'semantic', 'components'];
  const normalized = input
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is TokenCategory => allowed.includes(item as TokenCategory));
  const unique = normalized.filter((item, index) => normalized.indexOf(item) === index);
  return unique.length > 0 ? unique : undefined;
}

function normalizeDefaultTab(input: unknown): TokenCategory | undefined {
  if (typeof input !== 'string') return undefined;
  const normalized = input.trim().toLowerCase();
  if (normalized === 'foundation' || normalized === 'semantic' || normalized === 'components') {
    return normalized;
  }
  return undefined;
}

function buildTheme(config: CliRuntimeConfig): ThemeConfig | undefined {
  const hasBrandColor = typeof config.brandColor === 'string' && config.brandColor.trim().length > 0;
  const themePreference = typeof config.theme === 'string' ? config.theme.trim().toLowerCase() : '';
  const mode =
    themePreference === 'light' || themePreference === 'dark'
      ? themePreference
      : themePreference === 'system'
        ? getSystemThemeMode()
        : undefined;

  if (!mode && !hasBrandColor) return undefined;

  return {
    ...(mode ? { mode } : {}),
    ...(hasBrandColor ? { colors: { primary: config.brandColor } } : {}),
  };
}

function getRuntimeConfig(): CliRuntimeConfig {
  const raw = window.__TOKVISTA_CONFIG__;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as CliRuntimeConfig;
}

const mountNode = document.getElementById('tokvista-root');

if (!mountNode) {
  throw new Error('TokVista CLI mount node not found.');
}

const runtimeConfig = getRuntimeConfig();
const theme = buildTheme(runtimeConfig);
const categories = normalizeCategories(runtimeConfig.categories);
const defaultTab = normalizeDefaultTab(runtimeConfig.defaultTab);
const showSearch = typeof runtimeConfig.showSearch === 'boolean' ? runtimeConfig.showSearch : true;

createRoot(mountNode).render(
  <React.StrictMode>
    <TokenDocumentation
      tokens={window.__TOKVISTA_TOKENS__ as Record<string, unknown>}
      title={runtimeConfig.title || 'Design Tokens'}
      subtitle={typeof runtimeConfig.subtitle === 'string' ? runtimeConfig.subtitle : undefined}
      logo={typeof runtimeConfig.logo === 'string' ? runtimeConfig.logo : undefined}
      defaultTab={defaultTab}
      categories={categories}
      showSearch={showSearch}
      theme={theme}
    />
  </React.StrictMode>
);
