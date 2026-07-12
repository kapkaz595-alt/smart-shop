// ==========================================================================
// theme.js
// 主题切换：浅色 / 深色。持久化到 localStorage。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';

/**
 * 获取当前主题，默认浅色。
 * @returns {'light' | 'dark'}
 */
export function getTheme() {
  const saved = getJson(KEYS.THEME, 'light');
  return saved === 'dark' ? 'dark' : 'light';
}

/**
 * 应用主题：切换 html 的 dark class，更新按钮图标，写入 localStorage 和 state。
 * @param {'light' | 'dark'} theme
 */
export function applyTheme(theme) {
  const html = document.documentElement;
  const isDark = theme === 'dark';

  html.classList.toggle('dark', isDark);

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    // 浅色模式显示🌙（点击后进入深色），深色模式显示☀️（点击后进入浅色）
    btn.textContent = isDark ? '☀️' : '🌙';
  }

  setJson(KEYS.THEME, theme);
  setState({ theme });
}

/**
 * 设置主题（供外部按需直接指定）。
 * @param {'light' | 'dark'} theme
 */
export function setTheme(theme) {
  applyTheme(theme === 'dark' ? 'dark' : 'light');
}

/**
 * 在浅色 / 深色之间切换一次。
 */
export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

/**
 * 初始化主题：读取上次保存的选择并应用。
 */
export function initTheme() {
  applyTheme(getTheme());
}
