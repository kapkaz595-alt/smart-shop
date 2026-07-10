// ==========================================================================
// storage.js
// 封装 localStorage 操作，统一管理键名、序列化与错误处理。
// 所有购物车、收藏、浏览历史、搜索历史、订单、主题、语言都通过这里读写。
// ==========================================================================

const PREFIX = 'smartshop:';

const KEYS = {
  CART: `${PREFIX}cart`,
  FAVORITES: `${PREFIX}favorites`,
  HISTORY: `${PREFIX}history`,
  SEARCH_HISTORY: `${PREFIX}searchHistory`,
  ORDERS: `${PREFIX}orders`,
  THEME: `${PREFIX}theme`,
  LANGUAGE: `${PREFIX}language`,
  ADMIN_SESSION: `${PREFIX}adminSession`,
};

export { KEYS };

/**
 * 读取 JSON 数据，失败时返回默认值。
 * @param {string} key
 * @param {any} defaultValue
 */
export function getJson(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (error) {
    console.warn(`读取 localStorage 失败：${key}`, error);
    return defaultValue;
  }
}

/**
 * 写入 JSON 数据。
 * @param {string} key
 * @param {any} value
 */
export function setJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`写入 localStorage 失败：${key}`, error);
  }
}

/**
 * 删除指定键。
 * @param {string} key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`删除 localStorage 失败：${key}`, error);
  }
}

/**
 * 限制数组长度，保留最新的 N 条。
 * @param {Array} list
 * @param {number} limit
 * @param {string} order 'newest' | 'oldest'
 */
export function limitList(list, limit, order = 'newest') {
  if (!Array.isArray(list)) return [];
  if (list.length <= limit) return list;
  return order === 'newest' ? list.slice(-limit) : list.slice(0, limit);
}

/**
 * 向数组开头添加元素，去重，并限制长度。
 * @param {Array} list
 * @param {any} item
 * @param {number} limit
 * @param {(a, b) => boolean} isEqual
 */
export function prependUnique(list, item, limit, isEqual) {
  const arr = Array.isArray(list) ? list : [];
  const filtered = arr.filter((entry) => !isEqual(entry, item));
  const next = [...filtered, item];
  return limitList(next, limit, 'newest');
}

