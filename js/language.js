// ==========================================================================
// language.js
// 多语言支持：通过 JSON 字典切换界面语言。
// 目前支持 zh-CN（中文），已预留 kk（哈萨克语）、ru（俄语）、en（英文）扩展。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';

const translations = {
  'zh-CN': {
    home: '首页',
    products: '全部商品',
    cart: '购物车',
    favorites: '我的收藏',
    orders: '我的订单',
    search: '搜索商品',
    categories: '分类',
    hot: '热门商品',
    new: '新品上市',
    promotions: '优惠专区',
    recommendations: '猜你喜欢',
    recentlyViewed: '最近浏览',
    addToCart: '加入购物车',
    viewDetails: '查看详情',
    outOfStock: '暂时缺货',
    inStock: '有货',
    favorite: '收藏',
    favorited: '已收藏',
    submitOrder: '提交订单',
    orderNo: '订单编号',
    orderStatus: '订单状态',
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    emptyCart: '购物车还是空的',
    emptyFavorites: '还没有收藏任何商品',
    emptyOrders: '还没有订单',
    shopName: '阳光便利店',
  },
  en: {
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    favorites: 'Favorites',
    orders: 'Orders',
    search: 'Search products',
    categories: 'Categories',
    hot: 'Hot Products',
    new: 'New Arrivals',
    promotions: 'Promotions',
    recommendations: 'You May Like',
    recentlyViewed: 'Recently Viewed',
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    favorite: 'Favorite',
    favorited: 'Favorited',
    submitOrder: 'Submit Order',
    orderNo: 'Order No',
    orderStatus: 'Status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    emptyCart: 'Your cart is empty',
    emptyFavorites: 'No favorites yet',
    emptyOrders: 'No orders yet',
    shopName: 'Sunshine Shop',
  },
  ru: {
    home: 'Главная',
    products: 'Товары',
    cart: 'Корзина',
    favorites: 'Избранное',
    orders: 'Заказы',
    search: 'Поиск товаров',
    categories: 'Категории',
    hot: 'Популярные',
    new: 'Новинки',
    promotions: 'Акции',
    recommendations: 'Вам может понравиться',
    recentlyViewed: 'Недавно просмотренные',
    addToCart: 'В корзину',
    viewDetails: 'Подробнее',
    outOfStock: 'Нет в наличии',
    inStock: 'В наличии',
    favorite: 'В избранное',
    favorited: 'В избранном',
    submitOrder: 'Оформить заказ',
    orderNo: 'Номер заказа',
    orderStatus: 'Статус',
    pending: 'Ожидает',
    confirmed: 'Подтвержден',
    completed: 'Выполнен',
    cancelled: 'Отменен',
    emptyCart: 'Корзина пуста',
    emptyFavorites: 'Нет избранного',
    emptyOrders: 'Нет заказов',
    shopName: 'Магазин Солнечный',
  },
  kk: {
    home: 'Басты бет',
    products: 'Тауарлар',
    cart: 'Себет',
    favorites: 'Таңдаулылар',
    orders: 'Тапсырыстар',
    search: 'Тауарларды іздеу',
    categories: 'Санаттар',
    hot: 'Танымал',
    new: 'Жаңа түсім',
    promotions: 'Акциялар',
    recommendations: 'Сізге ұнауы мүмкін',
    recentlyViewed: 'Жақында қаралған',
    addToCart: 'Себетке қосу',
    viewDetails: 'Толығырақ',
    outOfStock: 'Қолжетімсіз',
    inStock: 'Қолжетімді',
    favorite: 'Таңдаулы',
    favorited: 'Таңдаулыда',
    submitOrder: 'Тапсырыс беру',
    orderNo: 'Тапсырыс нөмірі',
    orderStatus: 'Күйі',
    pending: 'Растауды күтуде',
    confirmed: 'Расталды',
    completed: 'Аяқталды',
    cancelled: 'Бас тартылды',
    emptyCart: 'Себет бос',
    emptyFavorites: 'Таңдаулы жоқ',
    emptyOrders: 'Тапсырыс жоқ',
    shopName: 'Күн Шуашы Дүкен',
  },
};

/**
 * 获取当前语言。
 */
/**
 * 初始化语言：从 localStorage 读取并应用。
 */
export function initLanguage() {
  const lang = getJson(KEYS.LANGUAGE, 'zh-CN');
  document.documentElement.lang = lang;
  applyTranslations(lang);
}

/**
 * 获取当前语言。
 */
export function getLanguage() {
  return getJson(KEYS.LANGUAGE, 'zh-CN');
}

/**
 * 切换语言。
 * @param {string} lang
 */
export function setLanguage(lang) {
  setJson(KEYS.LANGUAGE, lang);
  setState({ language: lang });
  document.documentElement.lang = lang;
  applyTranslations(lang);
}

/**
 * 获取翻译文本。
 * @param {string} key
 * @param {string} lang
 */
export function t(key, lang) {
  const current = lang || getLanguage();
  const dict = translations[current] || translations['zh-CN'];
  return dict[key] || translations['zh-CN'][key] || key;
}

/**
 * 应用页面上的 data-i18n 属性文本。
 * @param {string} lang
 */
export function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key, lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key, lang);
  });
}

export { translations };

