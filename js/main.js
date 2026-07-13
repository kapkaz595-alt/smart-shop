// ==========================================================================
// main.js - SmartShop 前端入口 (完全调试版 - 添加错误处理和本地数据)
// ==========================================================================

import { fetchHomeData } from './api.js';
import { initPersistedState, getState, setState, subscribe } from './state.js';
import { initTheme } from './theme.js';
import { initLanguage, setLanguage, getLanguage, t } from './language.js';
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

// 防抖函数
function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const searchInput = document.getElementById('search-input');
const cartBtn = document.getElementById('cart-btn');
const favBtn = document.getElementById('favorites-btn');
const ordersBtn = document.getElementById('orders-btn');
const adminBtn = document.getElementById('admin-btn');
const langSelect = document.getElementById('lang-select');

// 备用数据 - 当API失败时使用
const FALLBACK_PRODUCTS = [];
const FALLBACK_CATEGORIES = [];

async function init() {
  try {
    console.log('[Init] 开始初始化应用...');
    
    initTheme();
    initPersistedState();
    
    initLanguage();
    if (langSelect) langSelect.value = getLanguage();

    console.log('[Init] 正在加载数据...');
    
    let homeData;
    try {
      homeData = await fetchHomeData();
      console.log('[Init] 数据加载成功:', homeData);
    } catch (apiError) {
      console.error('[Init] API错误:', apiError);
      console.log('[Init] 使用备用数据...');
      // 如果API失败，使用备用数据
      homeData = {
        products: FALLBACK_PRODUCTS,
        categories: FALLBACK_CATEGORIES,
        shop: {
          id: 'shop001',
          name: '阳光便利店',
          logo: '☀️',
          description: '家门口的精品小商店',
          phone: '138-0000-0000',
          hours: '每天 09:00 - 22:00',
          address: '某某市幸福路 88 号',
          currency: 'KZT',
          currencyName: '坚戈',
        },
        banners: [],
        announcements: [],
      };
    }
    
    const { products, categories, shop, banners, announcements } = homeData;
    
    console.log('[Init] 设置状态:', {
      productsCount: products?.length || 0,
      categoriesCount: categories?.length || 0,
      shop: shop?.name,
    });
    
    setState({ 
      products: products || [], 
      categories: categories || [], 
      shop, 
      banners: banners || [], 
      announcements: announcements || [], 
      activeCategory: ALL_CATEGORIES_LABEL,
      searchTerm: ''
    });

    console.log('[Init] 渲染UI...');
    renderShopHeader(shop);
    renderFooter(shop);
    renderBanners(banners);
    renderAnnouncements(announcements);
    
    // 初始渲染分类
    renderCategories(categories || [], ALL_CATEGORIES_LABEL, handleCategorySelect);
    
    renderAllSections();
    bindEvents();
    renderCartSummary(loadCart());
    
    console.log('[Init] 初始化完成！');
    
  } catch (error) {
    console.error('[Init] 初始化失败：', error);
    alert('应用初始化失败，请刷新页面重试。\n错误: ' + error.message);
  }
}

// ========== 事件处理函数 ==========

/**
 * 处理分类点击事件
 */
function handleCategorySelect(category) {
  console.log('[Event] 分类切换:', category);
  setState({ activeCategory: category, searchTerm: '' });
  if (searchInput) searchInput.value = '';
  renderFilteredProducts();
  
  // 自动滚动到商品区域
  setTimeout(() => {
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
      console.log('[Event] 滚动到商品区域');
      productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

/**
 * 处理商品打开（弹窗）
 */
function handleOpenProduct(product) {
  console.log('[Event] 打开商品:', product.name);
  recordView(product.id);
  openProduct(product);
}

/**
 * 处理收藏切换
 */
function handleToggleFavorite(product) {
  console.log('[Event] 收藏切换:', product.name);
  toggleFavorite(product.id);
  renderFilteredProducts();
  renderAllSections();
}

/**
 * 处理加入购物车
 */
function handleAddToCart(product, event) {
  console.log('[Event] 加入购物车:', product.name);
  addToCart(product);
  if (event) {
    event.target.textContent = '✓';
    setTimeout(() => {
      event.target.textContent = '🛒';
    }, 1500);
  }
}

function bindEvents() {
  console.log('[Event] 绑定事件...');
  
  // 搜索逻辑 - 使用防抖优化
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const term = e.target.value.trim();
      console.log('[Event] 搜索:', term);
      setState({ searchTerm: term, activeCategory: ALL_CATEGORIES_LABEL });
      renderFilteredProducts();
    }, 250));
  }

  // 语言切换
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      console.log('[Event] 语言切换:', selectedLang);
      setLanguage(selectedLang);
      
      renderAllSections();
      
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
          } else {
            el.textContent = translation;
          }
        }
      });
      
      renderShopHeader(getState().shop);
      renderCategories(getState().categories, getState().activeCategory, handleCategorySelect);
    });
  }

  // 导航跳转
  if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
  if (favBtn) favBtn.addEventListener('click', () => window.location.href = 'favorites.html');
  if (ordersBtn) ordersBtn.addEventListener('click', () => window.location.href = 'orders.html');
  if (adminBtn) adminBtn.addEventListener('click', () => window.location.href = 'admin/login.html');

  subscribe((state) => renderCartSummary(state.cart));
}

function renderAllSections() {
  const { products, favorites, history } = getState();
  console.log('[Render] 渲染全部分区', { productsCount: products.length });
  
  renderFilteredProducts();
  renderSection('promotions-grid', getPromotionProducts(products, 8));
  renderSection('new-grid', getNewProducts(products, 8));
  renderSection('hot-grid', getHotProducts(products, 8));
  renderSection('recommend-grid', getRecommendedProducts(products, history, favorites, 8));
}

function renderFilteredProducts() {
  const { products, searchTerm, activeCategory, favorites } = getState();
  console.log('[Render] 渲染过滤商品', { category: activeCategory, searchTerm, count: products.length });
  
  const byCategory = filterProducts(products, activeCategory);
  const filtered = searchProducts(byCategory, searchTerm);
  console.log('[Render] 过滤后商品数:', filtered.length);
  
  renderProducts(filtered, { 
    onOpen: handleOpenProduct, 
    onToggleFavorite: handleToggleFavorite, 
    onAddToCart: handleAddToCart, 
    favorites 
  });
}

function renderSection(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    console.warn(`[Render] 未找到 grid: ${gridId}`);
    return;
  }
  console.log(`[Render] 渲染分区 ${gridId}:`, products.length);
  
  renderProducts(products, { 
    onOpen: handleOpenProduct, 
    onToggleFavorite: handleToggleFavorite, 
    onAddToCart: handleAddToCart, 
    gridId,
    favorites: getState().favorites
  });
}

// 初始化
console.log('[Main] 页面加载，开始初始化...');
init();
