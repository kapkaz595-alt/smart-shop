// ==========================================================================
// theme.js
// 主题切换：浅色 / 深色 / 跟随系统。持久化到 localStorage。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * 获取当前主题。
 */
export function getTheme() {
  return getJson(KEYS.THEME, 'auto');
}

/**
 * 应用主题。
 * @param {string} theme 'light' | 'dark' | 'auto'
 */
export function applyTheme(theme) {
  const html = document.documentElement;
  html.classList.remove('dark');

  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'auto') {
    const prefersDark = window.matchMedia(DARK_QUERY).matches;
    if (prefersDark) html.classList.add('dark');
  }

  setJson(KEYS.THEME, theme);
  setState({ theme });
}

/**
 * 切换主题。
 * @param {string} theme
 */
export function setTheme(theme) {
  applyTheme(theme);
}

/**
 * 监听系统主题变化。
 */
export function watchSystemTheme() {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', () => {
    const current = getTheme();
    if (current === 'auto') applyTheme('auto');
  });
}

/**
 * 初始化主题。
 */
export function initTheme() {
  applyTheme(getTheme());
  watchSystemTheme();
}

