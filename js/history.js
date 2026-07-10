// ==========================================================================
// history.js
// 浏览历史与搜索历史：记录用户最近浏览和搜索，上限各 20 条。
// ==========================================================================

import { KEYS, getJson, setJson, limitList, prependUnique } from './storage.js';
import { setState } from './state.js';

const MAX_HISTORY = 20;
const MAX_SEARCH_HISTORY = 20;

/**
 * 记录浏览商品。
 * @param {Object} product
 */
export function recordView(product) {
  const history = getJson(KEYS.HISTORY, []);
  const entry = {
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    viewedAt: Date.now(),
  };
  const next = prependUnique(history, entry, MAX_HISTORY, (a, b) => a.id === b.id);
  setJson(KEYS.HISTORY, next);
  setState({ history: next });
}

/**
 * 加载浏览历史。
 */
export function loadHistory() {
  return getJson(KEYS.HISTORY, []);
}

/**
 * 记录搜索关键词。
 * @param {string} term
 */
export function recordSearch(term) {
  const history = getJson(KEYS.SEARCH_HISTORY, []);
  const keyword = term.trim();
  if (!keyword) return history;
  const filtered = history.filter((item) => item !== keyword);
  const next = [keyword, ...filtered].slice(0, MAX_SEARCH_HISTORY);
  setJson(KEYS.SEARCH_HISTORY, next);
  setState({ searchHistory: next });
  return next;
}

/**
 * 加载搜索历史。
 */
export function loadSearchHistory() {
  return getJson(KEYS.SEARCH_HISTORY, []);
}

/**
 * 清空搜索历史。
 */
export function clearSearchHistory() {
  setJson(KEYS.SEARCH_HISTORY, []);
  setState({ searchHistory: [] });
}

/**
 * 渲染搜索历史下拉框。
 * @param {Array<string>} history
 * @param {(term: string) => void} onSelect
 */
export function renderSearchHistory(history, onSelect) {
  const box = document.getElementById('search-history');
  if (!box) return;

  if (!history.length) {
    box.classList.remove('active');
    return;
  }

  box.innerHTML = `
    <div class="search-history-title">最近搜索</div>
    ${history
      .map(
        (term) => `
      <div class="search-history-item" data-term="${term}">
        <span>🔍 ${term}</span>
      </div>
    `,
      )
      .join('')}
  `;

  box.querySelectorAll('.search-history-item').forEach((item) => {
    item.addEventListener('click', () => onSelect(item.dataset.term));
  });
}

