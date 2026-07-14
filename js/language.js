// ==========================================================================
// language.js
// 多语言支持：通过 JSON 字典切换界面语言。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';

const translations = {
  kk: {
    home: 'Басты бет', products: 'Тауарлар', cart: 'Себет', favorites: 'Таңдаулылар',
    orders: 'Тапсырыстар', admin: 'Басқару', search: 'Тауарларды іздеу',
    searchPlaceholder: 'Тауар, брендті іздеу...', categories: 'Санаттар', hot: 'Танымал',
    hotSection: '🏆 Танымал тауарлар', new: 'Жаңа түсім', newSection: '✨ Жаңа түсім',
    promotions: 'Акциялар', promotionsSection: '🔥 Акциялар', recommendSection: '💡 Сізге ұнауы мүмкін',
    viewAll: 'Барлығын көру →', addToCart: 'Себетке қосу', viewDetails: 'Толығырақ',
    outOfStock: 'Қолжетімсіз', inStock: 'Қолжетімді', favorite: 'Таңдаулы',
    emptyCart: 'Себет бос', emptyFavorites: 'Таңдаулы жоқ', emptyOrders: 'Тапсырыс жоқ',
    shopTitle: 'Күн Шуашы Дүкен | SmartShop', shopName: 'Күн Шуашы Дүкен',
    shopSlogan: 'Есік алдындағы цифрлық сөре',
    shopInfo: 'Дүкен туралы ақпарат',
    quickContact: 'Жылдам байланыс',
    googleMapNav: 'Google Map арқылы жол көрсету',
    allRightsReserved: 'Барлық құқықтар қорғалған.',
    productDesc: 'Тауар сипаттамасы',
    productFeatures: 'Тауар ерекшеліктері',
    emptyState: 'Қазірше тауар жоқ.',
    noProductsFound: 'Тиісті тауар табылмады, басқа кілт сөз қолданып көріңіз.',
    recommendEmpty: 'Көбірек тауар қарағаннан кейін, осында сізге ұсыныстар шығады.'
  },
  ru: {
    home: 'Главная', products: 'Товары', cart: 'Корзина', favorites: 'Избранное',
    orders: 'Заказы', admin: 'Управление', search: 'Поиск товаров',
    searchPlaceholder: 'Поиск товаров, брендов...', categories: 'Категории', hot: 'Популярные',
    hotSection: '🏆 Популярные товары', new: 'Новинки', newSection: '✨ Новинки',
    promotions: 'Акции', promotionsSection: '🔥 Акции', recommendSection: '💡 Вам может понравиться',
    viewAll: 'Смотреть все →', addToCart: 'В корзину', viewDetails: 'Подробнее',
    outOfStock: 'Нет в наличии', inStock: 'В наличии', favorite: 'В избранное',
    emptyCart: 'Корзина пуста', emptyFavorites: 'Нет избранного', emptyOrders: 'Нет заказов',
    shopTitle: 'Магазин Солнечный | SmartShop', shopName: 'Магазин Солнечный',
    shopSlogan: 'Цифровая витрина у вашего дома',
    shopInfo: 'Информация о магазине',
    quickContact: 'Быстрая связь',
    googleMapNav: 'Маршрут через Google Карты',
    allRightsReserved: 'Все права защищены.',
    productDesc: 'Описание товара',
    productFeatures: 'Особенности товара',
    emptyState: 'Пока нет товаров.',
    noProductsFound: 'Товары не найдены, попробуйте другой запрос.',
    recommendEmpty: 'Просмотрите больше товаров, и здесь появятся рекомендации.'
  },
  en: {
    home: 'Home', products: 'Products', cart: 'Cart', favorites: 'Favorites',
    orders: 'Orders', admin: 'Admin', search: 'Search',
    searchPlaceholder: 'Search products...', categories: 'Categories', hot: 'Hot',
    hotSection: '🏆 Hot Products', new: 'New', newSection: '✨ New Arrivals',
    promotions: 'Promotions', promotionsSection: '🔥 Promotions', recommendSection: '💡 You May Like',
    viewAll: 'View All →', addToCart: 'Add to Cart', viewDetails: 'View Details',
    outOfStock: 'Out of Stock', inStock: 'In Stock', favorite: 'Favorite',
    emptyCart: 'Cart is empty', emptyFavorites: 'No favorites', emptyOrders: 'No orders',
    shopTitle: 'Sunshine Shop | SmartShop', shopName: 'Sunshine Shop',
    shopSlogan: 'Your digital shelf around the corner',
    shopInfo: 'Shop Info',
    quickContact: 'Quick Contact',
    googleMapNav: 'Google Map Directions',
    allRightsReserved: 'All rights reserved.',
    productDesc: 'Product Description',
    productFeatures: 'Product Features',
    emptyState: 'No products yet.',
    noProductsFound: 'No matching products found, try another keyword.',
    recommendEmpty: 'Browse more products and we\u2019ll recommend some here.'
  },
  'zh-CN': {
    home: '首页', products: '全部商品', cart: '购物车', favorites: '我的收藏',
    orders: '我的订单', admin: '管理', search: '搜索商品',
    searchPlaceholder: '搜索商品、品牌...', categories: '分类', hot: '热门',
    hotSection: '🏆 热门商品', new: '新品', newSection: '✨ 新品上市',
    promotions: '优惠', promotionsSection: '🔥 优惠专区', recommendSection: '💡 猜你喜欢',
    viewAll: '查看全部 →', addToCart: '加入购物车', viewDetails: '查看详情',
    outOfStock: '暂时缺货', inStock: '有货', favorite: '收藏',
    emptyCart: '购物车为空', emptyFavorites: '暂无收藏', emptyOrders: '暂无订单',
    shopTitle: '阳光便利店 | SmartShop', shopName: '阳光便利店',
    shopSlogan: '家门口的数字货架',
    shopInfo: '店铺信息',
    quickContact: '快速联系',
    googleMapNav: 'Google Map 导航',
    allRightsReserved: '保留所有权利。',
    productDesc: '商品介绍',
    productFeatures: '商品特点',
    emptyState: '暂无相关商品。',
    noProductsFound: '没有找到相关商品，换个关键词试试吧。',
    recommendEmpty: '浏览更多商品后，会在这里为您推荐。'
  }
};

export function initLanguage() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  applyTranslations(lang);
}

export function getLanguage() {
  return getJson(KEYS.LANGUAGE, 'kk');
}

export function setLanguage(lang) {
  setJson(KEYS.LANGUAGE, lang);
  setState({ language: lang });
  document.documentElement.lang = lang;
  applyTranslations(lang);
}

export function t(key, lang) {
  const current = lang || getLanguage();
  const dict = translations[current] || translations['kk'];
  return dict[key] || translations['kk'][key] || key;
}

/**
 * 实时更新页面上所有标记了 data-i18n 的元素
 */
export function applyTranslations(lang) {
  const currentLang = lang || getLanguage();
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const translation = t(key, currentLang);
    if (translation) el.textContent = translation;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key, currentLang);
  });
  // 新增：处理 data-i18n-label（用于 aria-label，例如头部图标按钮）
  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    const key = el.dataset.i18nLabel;
    el.setAttribute('aria-label', t(key, currentLang));
  });
}

/**
 * 商品名称专用翻译辅助
 */
export function getProductName(productId, originalName) {
  const key = `prod_name_${productId}`;
  const translation = t(key);
  return translation === key ? originalName : translation;
}

export { translations };
