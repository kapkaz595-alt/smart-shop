// ==========================================================================
// main.js - SmartShop 前端入口 (实时多语言切换版)
// ==========================================================================

import { fetchHomeData } from './api.js';
import { initPersistedState, getState, setState, subscribe } from './state.js';
import { initTheme } from './theme.js';
import { initLanguage, setLanguage, getLanguage, t } from './language.js'; // 确保引入了 t
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
import { recordSearch, loadSearchHistory, renderSearchHistory, recordView } from './history.js';
import { filterProducts, filterPromotions, filterNewProducts, filterHotProducts } from './filter.js';
import { openProduct } from './modal.js';
import { addToCart, loadCart, renderCartSummary } from './cart.js';
import { toggleFavorite, loadFavorites } from './favorite.js';
import { getHotProducts, getRecommendedProducts, getNewProducts, getPromotionProducts } from './recommend.js';

const searchInput = document.getElementById('search-input');
const searchHistoryBox = document.getElementById('search-history');
const cartBtn = document.getElementById('cart-btn');
const favBtn = document.getElementById('favorites-btn');
const ordersBtn = document.getElementById('orders-btn');
const adminBtn = document.getElementById('admin-btn');
const langSelect = document.getElementById('lang-select');

async function init() {
  try {
    initTheme();
    initPersistedState();
    initLanguage();
    if (langSelect) langSelect.value = getLanguage();

    const { products, categories, shop, banners, announcements } = await fetchHomeData();
    setState({ products, categories, shop, banners, announcements, activeCategory: ALL_CATEGORIES_LABEL });

    renderShopHeader(shop);
    renderFooter(shop);
    renderBanners(banners);
    renderAnnouncements(announcements);
    renderCategories(categories, ALL_CATEGORIES_LABEL, handleCategorySelect);
    renderAllSections();
    bindEvents();
    renderCartSummary(loadCart());
  } catch (error) {
    console.error('初始化失败：', error);
  }
}

function bindEvents() {
  // 搜索逻辑
  if (searchInput) {
    searchInput.addEventListener('input', (e) => { setState({ searchTerm: e.target.value }); renderFilteredProducts(); });
    searchInput.addEventListener('focus', () => {
      renderSearchHistory(loadSearchHistory(), (selected) => {
        searchInput.value = selected;
        setState({ searchTerm: selected });
        renderFilteredProducts();
        searchHistoryBox.classList.remove('active');
      });
      searchHistoryBox.classList.add('active');
    });
  }

  // 【核心修改】实时多语言切换逻辑
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      setLanguage(selectedLang);
      
      // 1. 重新渲染商品区域（触发重新生成带新翻译名的 HTML）
      renderAllSections();
      
      // 2. 强制刷新页面上所有带有 data-i18n 属性的标签
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = translation;
          else el.textContent = translation;
        }
      });
      // 3. 更新页头文字
      renderShopHeader(getState().shop);
    });
  }

  if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
  if (favBtn) favBtn.addEventListener('click', () => window.location.href = 'favorites.html');
  if (ordersBtn) ordersBtn.addEventListener('click', () => window.location.href = 'orders.html');
  if (adminBtn) adminBtn.addEventListener('click', () => window.location.href = 'admin/login.html');

  subscribe((state) => renderCartSummary(state.cart));
}

function renderAllSections() {
  const { products, favorites, history } = getState();
  renderFilteredProducts();
  renderSection('promotions-grid', getPromotionProducts(products, 8));
  renderSection('new-grid', getNewProducts(products, 8));
  renderSection('hot-grid', getHotProducts(products, 8));
  renderSection('recommend-grid', getRecommendedProducts(products, history, favorites, 8));
}

function renderFilteredProducts() {
  const { products, searchTerm, activeCategory, favorites } = getState();
  const byCategory = filterProducts(products, activeCategory);
  renderProducts(searchProducts(byCategory, searchTerm), { 
    onOpen: handleOpenProduct, 
    onToggleFavorite: handleToggleFavorite, 
    onAddToCart: handleAddToCart, 
    favorites 
  });
}

function renderSection(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  renderProducts(products, { 
    onOpen: handleOpenProduct, 
    onToggleFavorite: handleToggleFavorite, 
    onAddToCart: handleAddToCart, 
    favorites: getState().favorites, 
    gridId 
  });
}

function handleCategorySelect(category) {
  setState({ activeCategory: category });
  renderCategories(getState().categories, category, handleCategorySelect);
  renderFilteredProducts();
}

function handleOpenProduct(product) { recordView(product); openProduct(product); }
function handleToggleFavorite(product) { toggleFavorite(product.id); renderAllSections(); }
function handleAddToCart(product, event) { if (event) event.stopPropagation(); addToCart(product, 1); }

document.addEventListener('DOMContentLoaded', init);

export { handleOpenProduct, handleToggleFavorite, handleAddToCart, renderFilteredProducts, handleCategorySelect };
