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
