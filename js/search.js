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
  if (!term) return products;
  
  const keyword = term.toLowerCase().trim();
  if (!keyword) return products;

  return products.filter((product) => {
    // 1. 检查商品名称 (例如: 国产红富士)
    const matchName = product.name ? product.name.toLowerCase().includes(keyword) : false;
    
    // 2. 检查分类 (例如: 水果蔬菜、饮料)
    const matchCategory = product.category ? product.category.toLowerCase().includes(keyword) : false;
    
    // 3. 检查品牌 (例如: 三全)
    const matchBrand = product.brand ? product.brand.toLowerCase().includes(keyword) : false;
    
    // 4. 检查描述说明
    const matchDesc = product.description ? product.description.toLowerCase().includes(keyword) : false;
    
    // 5. 检查别名/关键词/标签数组 (例如: 别名里写了 ["苹果", "apple"])
    let matchAliases = false;
    if (product.aliases) {
      if (Array.isArray(product.aliases)) {
        matchAliases = product.aliases.some(alias => String(alias).toLowerCase().includes(keyword));
      } else {
        matchAliases = String(product.aliases).toLowerCase().includes(keyword);
      }
    }

    // 只要上面任何一项匹配成功，这个商品就会被搜出来！
    return matchName || matchCategory || matchBrand || matchDesc || matchAliases || productMatches(product, keyword);
  });
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
