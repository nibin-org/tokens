import { watch } from 'node:fs';
import type { FSWatcher } from 'node:fs';

export function watchFile(filePath: string, onChange: () => void): FSWatcher {
  let debounce: NodeJS.Timeout | null = null;
  
  return watch(filePath, () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(onChange, 100);
  });
}
