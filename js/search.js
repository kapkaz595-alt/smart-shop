// ==========================================================================
// search.js
// 负责搜索过滤：支持商品名称、品牌、分类、关键词、规格、条形码、描述、别名。
// 未来可扩展为拼音、哈萨克语、俄语、英文多语言搜索。
// ==========================================================================

import { productMatches } from './utils.js';

/**
 * 根据关键词过滤商品列表。
 * @param {Array<Object>} products
 * @param {string} term
 * @returns {Array<Object>}
 */
export function searchProducts(products, term) {
  const keyword = term.trim();
  if (!keyword) return products;
  return products.filter((product) => productMatches(product, keyword));
}

/**
 * 保存搜索历史。
 * @param {string} term
 * @param {Array<string>} history
 * @param {number} limit
 * @returns {Array<string>}
 */
export function saveSearchHistory(term, history, limit = 20) {
  const keyword = term.trim();
  if (!keyword) return history;
  const filtered = history.filter((item) => item !== keyword);
  return [keyword, ...filtered].slice(0, limit);
}

