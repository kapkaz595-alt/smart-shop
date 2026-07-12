// ==========================================================================
// api.js
// 商品数据从 Supabase 数据库读取与写入；店铺信息、分类、轮播、公告从本地 JSON 读取。
// 升级版：完美融合 Supabase 驼峰/下划线自动转换，并集成多语言动态数据捞取。
// ==========================================================================

import { supabase } from './supabaseClient.js';
import { getLanguage } from './language.js'; // 引入语言状态获取函数

const BASE = import.meta.env.BASE_URL;

function buildUrl(path) {
  return `${BASE}${path}`;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`请求失败：${url}，HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * 【核心升级】处理多语言字段的提取。
 * 如果数据库里存的是一个对象 {"zh-CN": "苹果", "kk": "Алма"}，则根据当前语言动态返回。
 * 如果只是普通字符串，则直接返回原字符串（兼容老数据）。
 */
function parseI18nField(field, currentLang) {
  if (field && typeof field === 'object') {
    return field[currentLang] || field['kk'] || field['zh-CN'] || '';
  }
  return field || '';
}

/**
 * 把数据库字段（下划线命名）转换成前端一直在用的字段名（驼峰命名），
 * 并在转换的同时，把商品名称、分类、描述等字段转换为当前选择的语言！
 */
function mapProductRow(row) {
  const currentLang = getLanguage(); // 获取当前用户的语言环境 ('kk', 'zh-CN' 等)

  return {
    id: row.id,
    // 【多语言升级】动态提取对应语言的文本
    name: parseI18nField(row.name, currentLang),
    category: parseI18nField(row.category, currentLang),
    brand: parseI18nField(row.brand, currentLang),
    specs: parseI18nField(row.specs, currentLang),
    description: parseI18nField(row.description, currentLang),
    
    aliases: row.aliases || [],
    price: Number(row.price) || 0,
    originalPrice: Number(row.original_price) || 0,
    discount: row.discount,
    barcode: row.barcode,
    stock: Number(row.stock) || 0,
    image: row.image,
    images: row.images || [],
    features: row.features || [],
    nutrition: row.nutrition,
    productionDate: row.production_date,
    shelfLife: row.shelf_life,
    manufacturer: row.manufacturer,
    tags: row.tags || [],
    isNew: row.is_new,
    isHot: row.is_hot,
    isPromotion: row.is_promotion,
    promotionType: row.promotion_type,
    views: row.views,
    clicks: row.clicks,
    favorites: row.favorites,
  };
}

/**
 * 读取所有商品数据（从 Supabase 读取）。
 * @returns {Promise<Array<Object>>}
 */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`读取商品数据失败：${error.message}`);
  }
  return data.map(mapProductRow);
}

/**
 * 【全新加入】新增/导入商品接口
 * 自动解决前端数据因“驼峰命名”和“数据类型”导致 Supabase 报错拒绝导入的问题。
 * @param {Object} productData 前端表单收集到的商品对象
 */
export async function addProduct(productData) {
  // 1. 将前端的驼峰命名严格反向映射为数据库的下划线命名，并强转数字类型防报错
  const supabaseRow = {
    name: productData.name, // 如果支持多语言，表单传进来应当是对象 {"zh-CN": "苹果", "kk": "Алма"}
    price: Number(productData.price) || 0,
    original_price: Number(productData.originalPrice) || 0,
    discount: productData.discount,
    category: productData.category, // 可为字符串或多语言对象
    brand: productData.brand,
    specs: productData.specs,
    barcode: productData.barcode,
    stock: Number(productData.stock) || 0,
    image: productData.image,
    images: productData.images || [],
    description: productData.description,
    features: productData.features || [],
    nutrition: productData.nutrition,
    production_date: productData.productionDate,
    shelf_life: productData.shelfLife,
    manufacturer: productData.manufacturer,
    tags: productData.tags || [],
    is_new: Boolean(productData.isNew),
    is_hot: Boolean(productData.isHot),
    is_promotion: Boolean(productData.isPromotion),
    promotion_type: productData.promotionType,
    aliases: productData.aliases || []
  };

  // 2. 写入 Supabase 数据库
  const { data, error } = await supabase
    .from('products')
    .insert([supabaseRow])
    .select();

  if (error) {
    console.error('Supabase 写入失败详情:', error);
    throw new Error(`商品导入失败: ${error.message}`);
  }

  return data;
}

/**
 * 读取分类数据（仍从本地 JSON 读取）。
 */
export async function fetchCategories() {
  return fetchJson(buildUrl('data/categories.json'));
}

/**
 * 读取店铺信息（仍从本地 JSON 读取）。
 */
export async function fetchShop() {
  return fetchJson(buildUrl('data/shop.json'));
}

/**
 * 读取轮播广告数据（仍从本地 JSON 读取）。
 */
export async function fetchBanners() {
  return fetchJson(buildUrl('data/banner.json'));
}

/**
 * 读取店铺公告数据（仍从本地 JSON 读取）。
 */
export async function fetchAnnouncements() {
  return fetchJson(buildUrl('data/announcement.json'));
}

/**
 * 一次性加载首页所需的全部数据。
 */
export async function fetchHomeData() {
  const [products, categories, shop, banners, announcements] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchShop(),
    fetchBanners(),
    fetchAnnouncements(),
  ]);
  return { products, categories, shop, banners, announcements };
}
