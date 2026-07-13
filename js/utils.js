// ==========================================================================
// utils.js
// 通用工具函数：价格格式化、图片路径解析、字符串匹配、拼音辅助等。
// ==========================================================================

/**
 * 解析图片路径，加上部署前缀。
 * 如果 path 本身已经是完整 URL（如 Supabase Storage 返回的链接），
 * 直接原样返回，不再拼接 BASE_URL，避免变成无效地址。
 * @param {string} path
 */
export function resolveImagePath(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${import.meta.env.BASE_URL}${path}`;
}

/**
 * 格式化价格，保留整数。
 * @param {number} price
 */
export function formatPrice(price) {
  return Math.round(price).toLocaleString('zh-CN');
}

/**
 * 生成唯一 ID（简单版本）。
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * 生成订单编号。
 */
export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SS${date}${random}`;
}

/**
 * 简单的拼音/英文/中文混合匹配。
 * 支持商品名、别名、品牌、分类、关键词、规格、描述。
 * @param {Object} product
 * @param {string} keyword
 */
export function productMatches(product, keyword) {
  if (!keyword) return true;
  const k = keyword.toLowerCase().trim();
  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.specs,
    product.description,
    product.barcode,
    ...(product.aliases || []),
    ...(product.keywords || []),
    ...(product.features || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(k);
}

/**
 * 显示临时提示（Toast）。
 * @param {string} message
 * @param {number} duration
 */
export function showToast(message, duration = 2000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/**
 * 深度合并对象（用于 admin 编辑）。
 * @param {Object} target
 * @param {Object} source
 */
export function mergeObject(target, source) {
  return { ...target, ...source };
}

/**
 * 防抖函数。
 * @param {Function} fn
 * @param {number} delay
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
