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
    recommendEmpty: 'Көбірек тауар қарағаннан кейін, осында сізге ұсыныстар шығады.',

    // ---- Себет беті (жаңа) ----
    cartPageTitle: '🛒 Себет',
    totalLabel: 'Барлығы:',
    clearCartBtn: 'Себетті тазалау',
    checkout: 'Төлеуге өту',
    quickLinks: 'Жылдам сілтемелер',
    submitOrderTitle: 'Тапсырысты растау',
    customerNameLabel: 'Тегі, аты',
    customerNamePlaceholder: 'Атыңызды енгізіңіз',
    contactPhoneLabel: 'Байланыс телефоны',
    phonePlaceholder: 'Телефон нөміріңізді енгізіңіз',
    deliveryTypeLabel: 'Алу тәсілі',
    selfPickup: 'Дүкеннен өзі алу',
    homeDelivery: 'Үйге жеткізу',
    noteLabel: 'Ескертпе',
    notePlaceholder: 'Мысалы: тәтті болмасын, аулаға дейін жеткізіңіз...',
    kaspiTitle: '💳 QR арқылы төлеу',
    kaspiDesc: 'Тапсырыс дүкен иесінің WhatsApp-ына жіберілді. Kaspi қолданбасы арқылы QR кодты сканерлеп төлеңіз, төлегеннен кейін WhatsApp-та хабарлаңыз.',
    itemsUnit: 'дана',
    remove: 'Жою',
    outOfStockToast: 'Бұл тауар уақытша жоқ',
    addedToCartToast: 'Себетке қосылды',
    cartClearedToast: 'Себет тазаланды',

    // ---- Админ панелі (жаңа) ----
    adminLoginTitle: '🔐 Әдминыстратор',
    emailLabel: 'Email',
    passwordLabel: 'Құпия сөз',
    loginButton: 'Кіру',
    logoutButton: 'Шығу',
    adminPanel: 'Басқару панелі',
    productManagement: '📦 Тауарларды басқару',
    addProductBtn: '+ Жаңа тауар қосу',
    colImage: 'Сурет',
    colName: 'Атауы',
    colCategory: 'Санат',
    colPrice: 'Бағасы',
    colStock: 'Қалдық',
    colStatus: 'Күйі',
    colActions: 'Әрекет',
    editBtn: 'Өзгерту',
    deleteBtn: 'Жою',
    backToList: 'Тізімге қайту',
    newProductTitle: '📦 Жаңа тауар қосу',
    editProductTitle: '📝 Тауарды өзгерту',
    basicInfoSection: 'Негізгі ақпарат',
    productNameLabel: 'Тауар атауы *',
    categoryLabel: 'Санат *',
    brandLabel: 'Бренд',
    specsLabel: 'Сипаттама (көлемі/саны)',
    barcodeLabel: 'Штрих-код',
    aliasesLabel: 'Іздеу кілт сөздері',
    aliasesHint: 'Осы сөздер бойынша да табылады, үтірмен бөліңіз',
    descLabel: 'Тауар сипаттамасы',
    featuresLabel: 'Тауар ерекшеліктері',
    featuresHint: 'Тауар бетінде белгіше ретінде көрсетіледі, үтірмен бөліңіз',
    priceStockSection: 'Баға мен қалдық',
    priceLabel: 'Сату бағасы *',
    originalPriceLabel: 'Бастапқы баға',
    originalPriceHint: 'Толтырсаңыз, жеңілдік пайызы автоматты есептеледі',
    stockLabel: 'Қалдық саны *',
    productionInfoSection: 'Өндіріс туралы ақпарат',
    manufacturerLabel: 'Өндіруші',
    shelfLifeLabel: 'Сақтау мерзімі',
    productionDateLabel: 'Өндірілген күні',
    imageSection: 'Сурет',
    mainImageLabel: 'Негізгі сурет *',
    imageRequiredError: 'Тауардың негізгі суретін жүктеңіз',
    tagsPromotionSection: 'Белгілер мен акциялар',
    isNewLabel: 'Жаңа ✨',
    isHotLabel: 'Танымал 🔥',
    isPromotionLabel: 'Жеңілдік 🏷️',
    promotionTypeLabel: 'Акция сипаттамасы',
    saveBtn: 'Сақтау',
    cancelBtn: 'Бас тарту',
    savingBtn: 'Сақталуда...'
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
    recommendEmpty: 'Просмотрите больше товаров, и здесь появятся рекомендации.',

    // ---- Страница корзины (новое) ----
    cartPageTitle: '🛒 Корзина',
    totalLabel: 'Итого:',
    clearCartBtn: 'Очистить корзину',
    checkout: 'Перейти к оплате',
    quickLinks: 'Быстрые ссылки',
    submitOrderTitle: 'Оформить заказ',
    customerNameLabel: 'Имя клиента',
    customerNamePlaceholder: 'Введите имя',
    contactPhoneLabel: 'Контактный телефон',
    phonePlaceholder: 'Введите номер телефона',
    deliveryTypeLabel: 'Способ получения',
    selfPickup: 'Самовывоз',
    homeDelivery: 'Доставка на дом',
    noteLabel: 'Примечание',
    notePlaceholder: 'Например: без остроты, доставить до подъезда...',
    kaspiTitle: '💳 Оплата по QR-коду',
    kaspiDesc: 'Заказ отправлен владельцу магазина в WhatsApp. Оплатите через приложение Kaspi, отсканировав QR-код, и сообщите об оплате в WhatsApp.',
    itemsUnit: 'шт.',
    remove: 'Удалить',
    outOfStockToast: 'Товара временно нет в наличии',
    addedToCartToast: 'Добавлено в корзину',
    cartClearedToast: 'Корзина очищена',

    // ---- Админ-панель (новое) ----
    adminLoginTitle: '🔐 Вход для администратора',
    emailLabel: 'Email',
    passwordLabel: 'Пароль',
    loginButton: 'Войти',
    logoutButton: 'Выйти',
    adminPanel: 'Панель управления',
    productManagement: '📦 Управление товарами',
    addProductBtn: '+ Добавить товар',
    colImage: 'Фото',
    colName: 'Название',
    colCategory: 'Категория',
    colPrice: 'Цена',
    colStock: 'Остаток',
    colStatus: 'Статус',
    colActions: 'Действия',
    editBtn: 'Изменить',
    deleteBtn: 'Удалить',
    backToList: 'Назад к списку',
    newProductTitle: '📦 Добавить товар',
    editProductTitle: '📝 Редактировать товар',
    basicInfoSection: 'Основная информация',
    productNameLabel: 'Название товара *',
    categoryLabel: 'Категория *',
    brandLabel: 'Бренд',
    specsLabel: 'Характеристики (объём/кол-во)',
    barcodeLabel: 'Штрихкод',
    aliasesLabel: 'Ключевые слова для поиска',
    aliasesHint: 'Товар будет находиться и по этим словам, через запятую',
    descLabel: 'Описание товара',
    featuresLabel: 'Особенности товара',
    featuresHint: 'Отображаются как теги на странице товара, через запятую',
    priceStockSection: 'Цена и остаток',
    priceLabel: 'Цена продажи *',
    originalPriceLabel: 'Цена без скидки',
    originalPriceHint: 'Если заполнить, скидка в % посчитается автоматически',
    stockLabel: 'Остаток на складе *',
    productionInfoSection: 'Информация о производстве',
    manufacturerLabel: 'Производитель',
    shelfLifeLabel: 'Срок годности',
    productionDateLabel: 'Дата производства',
    imageSection: 'Фото',
    mainImageLabel: 'Главное фото товара *',
    imageRequiredError: 'Загрузите главное фото товара',
    tagsPromotionSection: 'Теги и акции',
    isNewLabel: 'Новинка ✨',
    isHotLabel: 'Популярное 🔥',
    isPromotionLabel: 'Акция 🏷️',
    promotionTypeLabel: 'Описание акции',
    saveBtn: 'Сохранить',
    cancelBtn: 'Отмена',
    savingBtn: 'Сохранение...'
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
    recommendEmpty: 'Browse more products and we\u2019ll recommend some here.',

    // ---- Cart page (new) ----
    cartPageTitle: '🛒 Cart',
    totalLabel: 'Total:',
    clearCartBtn: 'Clear Cart',
    checkout: 'Checkout',
    quickLinks: 'Quick Links',
    submitOrderTitle: 'Submit Order',
    customerNameLabel: 'Customer Name',
    customerNamePlaceholder: 'Enter your name',
    contactPhoneLabel: 'Phone Number',
    phonePlaceholder: 'Enter phone number',
    deliveryTypeLabel: 'Delivery Method',
    selfPickup: 'Pickup In-Store',
    homeDelivery: 'Home Delivery',
    noteLabel: 'Note',
    notePlaceholder: 'e.g. no spicy, deliver to the gate...',
    kaspiTitle: '💳 Scan to Pay',
    kaspiDesc: 'Your order has been sent to the shop owner via WhatsApp. Please scan the QR code in the Kaspi app to pay, then confirm payment via WhatsApp.',
    itemsUnit: 'items',
    remove: 'Remove',
    outOfStockToast: 'This item is temporarily out of stock',
    addedToCartToast: 'Added to cart',
    cartClearedToast: 'Cart cleared'
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
