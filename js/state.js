// ==========================================================================
// state.js
// 集中管理页面运行时状态。
// 通过 subscribe 机制，可以在状态变化时自动刷新相关 UI。
// ==========================================================================

import { KEYS, getJson } from './storage.js';

const state = {
  products: [],           // 全部商品
  categories: [],         // 全部分类
  shop: null,             // 店铺信息
  banners: [],            // 轮播广告
  announcements: [],     // 公告
  searchTerm: '',         // 当前搜索关键词
  activeCategory: '全部商品', // 当前选中的分类
  cart: [],               // 购物车
  favorites: [],          // 收藏
  history: [],            // 最近浏览
  searchHistory: [],      // 搜索历史
  orders: [],             // 订单
  theme: 'auto',          // 主题
  language: 'kk',         // 【已修改】默认语言改为哈萨克语 (kk)
  isAdmin: false,         // 是否管理员登录
};

const listeners = new Set();

export function getState() {
  return { ...state };
}

/**
 * 更新状态，并通知所有订阅者。
 * @param {Partial<typeof state>} patch
 */
export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((callback) => {
    try {
      callback(state);
    } catch (error) {
      console.error('state listener error:', error);
    }
  });
}

/**
 * 订阅状态变化。
 * @param {(state: typeof state) => void} callback
 * @returns {() => void} 取消订阅函数
 */
export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * 初始化持久化数据（购物车、收藏、历史、订单、主题、语言）。
 */
export function initPersistedState() {
  const patch = {
    cart: getJson(KEYS.CART, []),
    favorites: getJson(KEYS.FAVORITES, []),
    history: getJson(KEYS.HISTORY, []),
    searchHistory: getJson(KEYS.SEARCH_HISTORY, []),
    orders: getJson(KEYS.ORDERS, []),
    theme: getJson(KEYS.THEME, 'auto'),
    language: getJson(KEYS.LANGUAGE, 'kk'), // 【已修改】找不到缓存时，默认读取哈萨克语 (kk)
    isAdmin: getJson(KEYS.ADMIN_SESSION, false),
  };
  setState(patch);
}
