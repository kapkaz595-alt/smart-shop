// ==========================================================================
// language.js
// 多语言支持：通过 JSON 字典切换界面语言。
// 默认语言：kk（哈萨克语），支持 ru（俄语）、en（英文）、zh-CN（中文）随时切换。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';

const translations = {
  kk: {
    home: 'Басты бет',
    products: 'Тауарлар',
    cart: 'Себет',
    favorites: 'Таңдаулылар',
    orders: 'Тапсырыстар',
    admin: 'Басқару',
    search: 'Тауарларды іздеу',
    searchPlaceholder: 'Тауар, брендті іздеу...',
    categories: 'Санаттар',
    hot: 'Танымал',
    hotSection: '🏆 Танымал тауарлар',
    new: 'Жаңа түсім',
    newSection: '✨ Жаңа түсім',
    promotions: 'Акциялар',
    promotionsSection: '🔥 Акциялар',
    recommendations: 'Сізге ұнауы мүмкін',
    recommendSection: '💡 Сізге ұнауы мүмкін',
    recommendEmpty: 'Көбірек тауар қарағаннан кейін осында ұсыныстар пайда болады.',
    recentlyViewed: 'Жақында қаралған',
    viewAll: 'Барлығын көру →',
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
    emptyState: 'Әзірге тауар жоқ.',
    noProductsFound: 'Ештеңе табылмады, басқа сөз қолданып көріңіз.',
    productDesc: 'Тауар сипаттамасы',
    productFeatures: 'Тауар ерекшеліктері',
    shopInfo: 'Дүкен туралы',
    quickContact: 'Байланыс',
    googleMapNav: 'Google Map бағдары',
    settings: 'Баптаулар',
    themeLabel: 'Тема:',
    themeAuto: 'Автоматты',
    themeLight: 'Ашық',
    themeDark: 'Қараңғы',
    allRightsReserved: 'Барлық құқықтар қорғалған.',
    shopTitle: 'Күн Шуашы Дүкен | SmartShop',
    shopSlogan: 'Есік алдындағы цифрлық сөре',
    shopName: 'Күн Шуашы Дүкен',
  },
  ru: {
    home: 'Главная',
    products: 'Товары',
    cart: 'Корзина',
    favorites: 'Избранное',
    orders: 'Заказы',
    admin: 'Управление',
    search: 'Поиск товаров',
    searchPlaceholder: 'Поиск товаров, брендов, категорий...',
    categories: 'Категории',
    hot: 'Популярные',
    hotSection: '🏆 Популярные товары',
    new: 'Новинки',
    newSection: '✨ Новинки',
    promotions: 'Акции',
    promotionsSection: '🔥 Акции',
    recommendations: 'Вам может понравиться',
    recommendSection: '💡 Вам может понравиться',
    recommendEmpty: 'После просмотра большего числа товаров здесь появятся рекомендации.',
    recentlyViewed: 'Недавно просмотренные',
    viewAll: 'Смотреть все →',
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
    emptyState: 'Товаров пока нет.',
    noProductsFound: 'Ничего не найдено, попробуйте другой запрос.',
    productDesc: 'Описание товара',
    productFeatures: 'Особенности товара',
    shopInfo: 'О магазине',
    quickContact: 'Контакты',
    googleMapNav: 'Маршрут в Google Maps',
    settings: 'Настройки',
    themeLabel: 'Тема:',
    themeAuto: 'Автоматически',
    themeLight: 'Светлая',
    themeDark: 'Темная',
    allRightsReserved: 'Все права защищены.',
    shopTitle: 'Магазин Солнечный | SmartShop',
    shopSlogan: 'Цифровая полка у вашего дома',
    shopName: 'Магазин Солнечный',
  },
  en: {
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    favorites: 'Favorites',
    orders: 'Orders',
    admin: 'Admin',
    search: 'Search products',
    searchPlaceholder: 'Search products, brands, categories...',
    categories: 'Categories',
    hot: 'Hot Products',
    hotSection: '🏆 Hot Products',
    new: 'New Arrivals',
    newSection: '✨ New Arrivals',
    promotions: 'Promotions',
    promotionsSection: '🔥 Promotions',
    recommendations: 'You May Like',
    recommendSection: '💡 You May Like',
    recommendEmpty: 'Recommendations will appear here as you browse more products.',
    recentlyViewed: 'Recently Viewed',
    viewAll: 'View All →',
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
    emptyState: 'No products yet.',
    noProductsFound: 'No products found, try a different search.',
    productDesc: 'Product Description',
    productFeatures: 'Product Features',
    shopInfo: 'Shop Info',
    quickContact: 'Quick Contact',
    googleMapNav: 'Navigate via Google Maps',
    settings: 'Settings',
    themeLabel: 'Theme:',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    allRightsReserved: 'All rights reserved.',
    shopTitle: 'Sunshine Shop | SmartShop',
    shopSlogan: 'Your digital shelf next door',
    shopName: 'Sunshine Shop',
  },
  'zh-CN': {
    home: '首页',
    products: '全部商品',
    cart: '购物车',
    favorites: '我的收藏',
    orders: '我的订单',
    admin: '管理',
    search: '搜索商品',
    searchPlaceholder: '搜索商品、品牌、分类...',
    categories: '分类',
    hot: '热门商品',
    hotSection: '🏆 热门商品',
    new: '新品上市',
    newSection: '✨ 新品上市',
    promotions: '优惠专区',
    promotionsSection: '🔥 优惠专区',
    recommendations: '猜你喜欢',
    recommendSection: '💡 猜你喜欢',
    recommendEmpty: '浏览更多商品后，会在这里为您推荐。',
    recentlyViewed: '最近浏览',
    viewAll: '查看全部 →',
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
    emptyState: '暂无商品。',
    noProductsFound: '没有找到相关商品，换个关键词试试吧。',
    productDesc: '商品介绍',
    productFeatures: '商品特点',
    shopInfo: '店铺信息',
    quickContact: '快速联系',
    googleMapNav: 'Google Map 导航',
    settings: '设置',
    themeLabel: '主题：',
    themeAuto: '自动',
    themeLight: '浅色',
    themeDark: '深色',
    allRightsReserved: '保留所有权利。',
    shopTitle: '阳光便利店 | SmartShop',
    shopSlogan: '家门口的数字货架',
    shopName: '阳光便利店',
  }
};

/**
 * 初始化语言：从 localStorage 读取并应用（默认哈萨克语 'kk'）。
 */
export function initLanguage() {
  const lang = getJson(KEYS.LANGUAGE, 'kk');
  document.documentElement.lang = lang;
  applyTranslations(lang);
}

/**
 * 获取当前语言（默认哈萨克语 'kk'）。
 */
export function getLanguage() {
  return getJson(KEYS.LANGUAGE, 'kk');
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
  const dict = translations[current] || translations['kk'];
  // 如果当前选中的语言字典里没有这个词，优先返回哈萨克语，再没有才返回 key 键名
  return dict[key] || translations['kk'][key] || key;
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
