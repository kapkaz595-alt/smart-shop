// ==========================================================================
// recommend.js
// 推荐系统：热门商品、猜你喜欢、最近浏览推荐。
// 目前基于商品已有热度字段与用户浏览历史做简单推荐。
// 未来可接入后端推荐算法。
// ==========================================================================

/**
 * 计算热门商品（按浏览次数、点击次数、收藏次数加权）。
 * @param {Array<Object>} products
 * @param {number} limit
 */
export function getHotProducts(products, limit = 8) {
  return [...products]
    .map((p) => ({
      ...p,
      score: (p.views || 0) * 1 + (p.clicks || 0) * 2 + (p.favorites || 0) * 3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * 猜你喜欢：基于用户最近浏览的分类和商品推荐。
 * @param {Array<Object>} products
 * @param {Array<Object>} history
 * @param {Array<number>} favorites
 * @param {number} limit
 */
export function getRecommendedProducts(products, history, favorites, limit = 8) {
  const viewedIds = new Set(history.map((h) => h.id));
  const viewedCategories = new Set(
    history.map((h) => {
      const p = products.find((product) => product.id === h.id);
      return p ? p.category : null;
    }).filter(Boolean),
  );

  const scored = products
    .filter((p) => !viewedIds.has(p.id))
    .map((p) => {
      let score = 0;
      if (viewedCategories.has(p.category)) score += 3;
      if (favorites.includes(p.id)) score += 2;
      if (p.isHot) score += 1;
      if (p.isNew) score += 1;
      return { ...p, score };
    });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * 获取新品推荐。
 * @param {Array<Object>} products
 * @param {number} limit
 */
export function getNewProducts(products, limit = 8) {
  return [...products]
    .filter((p) => p.isNew)
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
}

/**
 * 获取促销推荐。
 * @param {Array<Object>} products
 * @param {number} limit
 */
export function getPromotionProducts(products, limit = 8) {
  return [...products]
    .filter((p) => p.isPromotion || p.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit);
}

