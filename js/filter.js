// ==========================================================================
// filter.js
// 负责分类筛选：根据当前选中的分类过滤商品。
// "全部商品" 代表显示全部。
// ==========================================================================

export const ALL_CATEGORIES_LABEL = '全部商品';

/**
 * 分类 id 与商品数据里 category 字段（中文）的对照表。
 * products.json 里的 category 字段目前仍然是中文（如 "饮料"、"水果"），
 * 而分类按钮现在传出来的值是 categories.json 里的 id（如 "drinks"、"fruit"）。
 * 这里做一次转换，避免要逐条修改 23 条商品数据。
 * 如果以后新增分类，记得在这里也加一行对照。
 */
const CATEGORY_ID_TO_ZH = {
  drinks: '饮料',
  snacks: '零食',
  milk: '牛奶',
  bread: '面包',
  fruit: '水果',
  vegetables: '蔬菜',
  'instant-noodles': '方便面',
  frozen: '冷冻食品',
  daily: '日用品',
};

/**
 * 按分类过滤商品。
 * @param {Array<Object>} products
 * @param {string} category 分类 id（如 "drinks"）或 ALL_CATEGORIES_LABEL
 * @returns {Array<Object>}
 */
export function filterProducts(products, category) {
  if (!category || category === ALL_CATEGORIES_LABEL) {
    return products;
  }
  const zhCategory = CATEGORY_ID_TO_ZH[category] || category;
  return products.filter((product) => product.category === zhCategory);
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
