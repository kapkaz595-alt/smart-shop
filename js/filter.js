// ==========================================================================
// filter.js
// 负责分类筛选：根据当前选中的分类过滤商品。
// "全部商品" 代表显示全部。
// ==========================================================================

export const ALL_CATEGORIES_LABEL = '全部商品';

/**
 * 按分类过滤商品。
 * @param {Array<Object>} products
 * @param {string} category
 * @returns {Array<Object>}
 */
export function filterProducts(products, category) {
  if (!category || category === ALL_CATEGORIES_LABEL) {
    return products;
  }
  return products.filter((product) => product.category === category);
}

/**
 * 按促销状态过滤。
 * @param {Array<Object>} products
 */
export function filterPromotions(products) {
  return products.filter((p) => p.isPromotion || p.discount > 0);
}

/**
 * 按新品状态过滤。
 * @param {Array<Object>} products
 */
export function filterNewProducts(products) {
  return products.filter((p) => p.isNew);
}

/**
 * 按热门状态过滤。
 * @param {Array<Object>} products
 */
export function filterHotProducts(products) {
  return products.filter((p) => p.isHot);
}

