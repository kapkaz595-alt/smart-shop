// ==========================================================================
// main.js - SmartShop 前端入口 (企业级容错版)
// ==========================================================================

import { initPersistedState, getState, setState, subscribe } from './state.js';
import { initTheme } from './theme.js';
import { initLanguage, setLanguage, getLanguage, t, applyTranslations } from './language.js';
import {
  renderShopHeader,
  renderBanners,
  renderAnnouncements,
  renderCategories,
  renderProducts,
  renderFooter,
  ALL_CATEGORIES_LABEL,
} from './render.js';
import { searchProducts } from './search.js';
import { recordView } from './history.js';
import { filterProducts } from './filter.js';
import { openProduct } from './modal.js';
import { addToCart, loadCart, renderCartSummary } from './cart.js';
import { toggleFavorite } from './favorite.js';
import { getHotProducts, getRecommendedProducts, getNewProducts, getPromotionProducts } from './recommend.js';
import { fetchHomeData } from './api.js';

// --------------------------------------------------------------------------
// 工具函数
// --------------------------------------------------------------------------
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 安全执行包装器：单个模块出错不影响其他模块渲染
function safeRun(label, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[SmartShop] "${label}" 执行失败：`, err);
  }
}

function showFatalError(message) {
  const container = document.getElementById('app') || document.body;
  const banner = document.createElement('div');
  banner.style.cssText =
    'background:#fee2e2;color:#991b1b;padding:12px 16px;font-size:14px;border-bottom:1px solid #fecaca;';
  banner.textContent = `⚠️ 页面加载出现问题：${message}（详情请查看控制台 Console）`;
  container.prepend(banner);
}

// 新增：滚动到"全部商品"区块，点击分类 / 搜索时调用
function scrollToProducts() {
  const section = document.getElementById('product-grid');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// --------------------------------------------------------------------------
// DOM 元素（延迟到 init 内部再取，避免脚本加载顺序问题）
// --------------------------------------------------------------------------
let searchInput, cartBtn, favBtn, ordersBtn, adminBtn, langSelect;

function cacheDom() {
  searchInput = document.getElementById('search-input');
  cartBtn = document.getElementById('cart-btn');
  favBtn = document.getElementById('favorites-btn');
  ordersBtn = document.getElementById('orders-btn');
  adminBtn = document.getElementById('admin-btn');
  langSelect = document.getElementById('lang-select');
}

// --------------------------------------------------------------------------
// 业务事件处理
// --------------------------------------------------------------------------
function handleCategorySelect(category) {
  setState({ activeCategory: category, searchTerm: '' });
  if (searchInput) searchInput.value = '';
  renderFilteredProducts();
  scrollToProducts(); // 新增：点击分类后滚动到商品区块
}

function handleOpenProduct(product) {
  safeRun('recordView', () => recordView(product.id));
  // 关键修复：打开弹窗时，把收藏 / 加购物车的回调一起传进去，
  // 否则 modal.js 内部的按钮点击后找不到对应的处理函数。
  safeRun('openProduct', () =>
    openProduct(product, {
      onToggleFavorite: handleToggleFavorite,
      onAddToCart: handleAddToCart,
    })
  );
}

function handleToggleFavorite(product) {
  safeRun('toggleFavorite', () => toggleFavorite(product.id));
  renderFilteredProducts();
  renderAllSections();
}

function handleAddToCart(product, event) {
  safeRun('addToCart', () => addToCart(product));
  if (event && event.target) {
    const original = event.target.textContent;
    event.target.textContent = '✓';
    setTimeout(() => {
      event.target.textContent = original || '🛒';
    }, 1500);
  }
}

// --------------------------------------------------------------------------
// 初始化主流程
// --------------------------------------------------------------------------
async function init() {
  cacheDom();

  // 第一阶段：与数据无关的初始化，先跑起来，保证 UI 骨架可用
  safeRun('initTheme', initTheme);
  safeRun('initPersistedState', initPersistedState);
  safeRun('initLanguage', () => {
    initLanguage();
    if (langSelect) langSelect.value = getLanguage();
  });

  // 第二阶段：拉取数据（这里最容易因为 Supabase 网络/字段问题而失败）
  let homeData;
  try {
    homeData = await fetchHomeData();
  } catch (error) {
    console.error('[SmartShop] fetchHomeData 请求失败：', error);
    showFatalError('商品数据加载失败，请检查网络或 Supabase 连接');
    homeData = {};
  }

  const {
    products = [],
    categories = [],
    shop = {},
    banners = [],
    announcements = [],
  } = homeData || {};

  if (!homeData || Object.keys(homeData).length === 0) {
    console.warn('[SmartShop] fetchHomeData 返回为空，页面将以空数据渲染骨架');
  }

  setState({
    products,
    categories,
    shop,
    banners,
    announcements,
    activeCategory: ALL_CATEGORIES_LABEL,
    searchTerm: '',
  });

  // 第三阶段：逐个渲染，任何一块出错都不拖累其他区块
  safeRun('renderShopHeader', () => renderShopHeader(shop));
  safeRun('renderFooter', () => renderFooter(shop));
  safeRun('renderBanners', () => renderBanners(banners));
  safeRun('renderAnnouncements', () => renderAnnouncements(announcements));
  safeRun('renderCategories', () =>
    renderCategories(categories, ALL_CATEGORIES_LABEL, handleCategorySelect)
  );
  safeRun('renderAllSections', renderAllSections);
  safeRun('applyTranslations', applyTranslations);
  safeRun('bindEvents', bindEvents);
  safeRun('renderCartSummary', () => renderCartSummary(loadCart()));
}

// --------------------------------------------------------------------------
// 事件绑定
// --------------------------------------------------------------------------
function bindEvents() {
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce((e) => {
        setState({ searchTerm: e.target.value });
        renderFilteredProducts();
        // 注意：打字过程中不自动滚动，只在按下搜索键/回车时才滚动
      }, 250)
    );

    // 新增：点击输入法的"搜索/前往"按钮时触发（type="search" 专属事件）
    searchInput.addEventListener('search', () => {
      setState({ searchTerm: searchInput.value });
      renderFilteredProducts();
      scrollToProducts();
    });

    // 新增：兼容部分安卓输入法只发 Enter 键、不发 search 事件的情况
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setState({ searchTerm: searchInput.value });
        renderFilteredProducts();
        scrollToProducts();
      }
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      safeRun('setLanguage', () => setLanguage(selectedLang));
      safeRun('renderAllSections', renderAllSections);
      safeRun('applyTranslations', applyTranslations);
      safeRun('renderShopHeader', () => renderShopHeader(getState().shop));
      safeRun('renderCategories', () =>
        renderCategories(getState().categories, getState().activeCategory, handleCategorySelect)
      );
    });
  }

  if (cartBtn) cartBtn.addEventListener('click', () => (window.location.href = 'cart.html'));
  if (favBtn) favBtn.addEventListener('click', () => (window.location.href = 'favorites.html'));
  if (ordersBtn) ordersBtn.addEventListener('click', () => (window.location.href = 'orders.html'));
  if (adminBtn) adminBtn.addEventListener('click', () => (window.location.href = 'admin/login.html'));

  subscribe((state) => safeRun('renderCartSummary(subscribe)', () => renderCartSummary(state.cart)));
}

// --------------------------------------------------------------------------
// 渲染逻辑
// --------------------------------------------------------------------------
function renderAllSections() {
  const { products = [], favorites = [], history = [] } = getState();

  renderFilteredProducts();

  safeRun('promotions-grid', () =>
    renderSection('promotions-grid', getPromotionProducts(products, 8))
  );
  safeRun('new-grid', () => renderSection('new-grid', getNewProducts(products, 8)));
  safeRun('hot-grid', () => renderSection('hot-grid', getHotProducts(products, 8)));
  safeRun('recommend-grid', () =>
    renderSection('recommend-grid', getRecommendedProducts(products, history, favorites, 8))
  );
}

function renderFilteredProducts() {
  const { products = [], searchTerm = '', activeCategory, favorites = [] } = getState();
  const byCategory = filterProducts(products, activeCategory);
  renderProducts(searchProducts(byCategory, searchTerm), {
    onOpen: handleOpenProduct,
    onToggleFavorite: handleToggleFavorite,
    onAddToCart: handleAddToCart,
    favorites,
  });
}

function renderSection(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    console.warn(`[SmartShop] 未找到 #${gridId}，跳过该区块渲染`);
    return;
  }
  renderProducts(products, {
    onOpen: handleOpenProduct,
    onToggleFavorite: handleToggleFavorite,
    onAddToCart: handleAddToCart,
    gridId,
    favorites: getState().favorites,
  });
}

// --------------------------------------------------------------------------
// 启动
// --------------------------------------------------------------------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
