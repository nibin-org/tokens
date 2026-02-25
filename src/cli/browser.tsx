import React from 'react';
import { createRoot } from 'react-dom/client';
import { TokenDocumentation } from '../components/TokenDocumentation';

declare global {
  interface Window {
    __TOKVISTA_TOKENS__?: unknown;
  }
}

const mountNode = document.getElementById('tokvista-root');

if (!mountNode) {
  throw new Error('TokVista CLI mount node not found.');
}

createRoot(mountNode).render(
  <React.StrictMode>
    <TokenDocumentation tokens={window.__TOKVISTA_TOKENS__ as Record<string, unknown>} />
  </React.StrictMode>
);
