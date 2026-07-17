// ==========================================================================
// api.js
// 商品数据从 Supabase 数据库读取与写入；店铺信息、分类、轮播、公告从本地 JSON 读取。
// 企业级加固版：数据源互相隔离，单个失败不拖累全局；路径统一走 public/ 目录。
// ==========================================================================

import { supabase } from './supabaseClient.js';
import { getLanguage } from './language.js';

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
 * 处理多语言字段的提取。
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
 * 把数据库字段（下划线命名）转换成前端字段名（驼峰命名），
 * 并同时按当前语言提取多语言字段。
 */
function mapProductRow(row) {
  const currentLang = getLanguage();

  return {
    id: row.id,
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
 */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`读取商品数据失败：${error.message}`);
  }
  return (data || []).map(mapProductRow);
}

/**
 * 新增/导入商品接口。
 */
export async function addProduct(productData) {
  const supabaseRow = {
    name: productData.name,
    price: Number(productData.price) || 0,
    original_price: Number(productData.originalPrice) || 0,
    discount: productData.discount,
    category: productData.category,
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
    aliases: productData.aliases || [],
  };

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
 * 更新商品信息（支持部分字段更新，比如只改库存或只改价格）。
 * @param {number} id
 * @param {Object} changes - 前端字段名（驼峰），只传需要改的字段即可
 */
export async function updateProduct(id, changes) {
  const supabaseRow = {};

  if (changes.name !== undefined) supabaseRow.name = changes.name;
  if (changes.price !== undefined) supabaseRow.price = Number(changes.price);
  if (changes.originalPrice !== undefined) supabaseRow.original_price = Number(changes.originalPrice);
  if (changes.discount !== undefined) supabaseRow.discount = changes.discount;
  if (changes.category !== undefined) supabaseRow.category = changes.category;
  if (changes.brand !== undefined) supabaseRow.brand = changes.brand;
  if (changes.specs !== undefined) supabaseRow.specs = changes.specs;
  if (changes.barcode !== undefined) supabaseRow.barcode = changes.barcode;
  if (changes.stock !== undefined) supabaseRow.stock = Number(changes.stock);
  if (changes.image !== undefined) supabaseRow.image = changes.image;
  if (changes.images !== undefined) supabaseRow.images = changes.images;
  if (changes.description !== undefined) supabaseRow.description = changes.description;
  if (changes.features !== undefined) supabaseRow.features = changes.features;
  if (changes.nutrition !== undefined) supabaseRow.nutrition = changes.nutrition;
  if (changes.productionDate !== undefined) supabaseRow.production_date = changes.productionDate;
  if (changes.shelfLife !== undefined) supabaseRow.shelf_life = changes.shelfLife;
  if (changes.manufacturer !== undefined) supabaseRow.manufacturer = changes.manufacturer;
  if (changes.tags !== undefined) supabaseRow.tags = changes.tags;
  if (changes.isNew !== undefined) supabaseRow.is_new = Boolean(changes.isNew);
  if (changes.isHot !== undefined) supabaseRow.is_hot = Boolean(changes.isHot);
  if (changes.isPromotion !== undefined) supabaseRow.is_promotion = Boolean(changes.isPromotion);
  if (changes.promotionType !== undefined) supabaseRow.promotion_type = changes.promotionType;
  if (changes.aliases !== undefined) supabaseRow.aliases = changes.aliases;

  const { data, error } = await supabase
    .from('products')
    .update(supabaseRow)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Supabase 更新失败详情:', error);
    throw new Error(`商品更新失败: ${error.message}`);
  }

  return data;
}

/**
 * 扣减商品库存（订单确认收款后调用，用减法方式核销库存）。
 * @param {number} id
 * @param {number} quantity - 要扣减的数量
 */
export async function decreaseStock(id, quantity) {
  // 先读取当前库存，避免直接覆盖导致数据不一致
  const { data: current, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`读取库存失败: ${fetchError.message}`);
  }

  const newStock = Math.max(0, (current?.stock || 0) - Number(quantity));

  const { data, error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`库存扣减失败: ${error.message}`);
  }

  return data;
}

/**
 * 删除商品。
 * @param {number} id
 */
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase 删除失败详情:', error);
    throw new Error(`商品删除失败: ${error.message}`);
  }

  return true;
}

/**
 * 读取分类数据（本地 JSON，位于 public/data/）。
 */
export async function fetchCategories() {
  return fetchJson(buildUrl('data/categories.json'));
}

/**
 * 读取店铺信息（本地 JSON，位于 public/data/）。
 */
export async function fetchShop() {
  return fetchJson(buildUrl('data/shop.json'));
}

/**
 * 读取轮播广告数据（本地 JSON，位于 public/data/）。
 */
export async function fetchBanners() {
  return fetchJson(buildUrl('data/banner.json'));
}

/**
 * 读取店铺公告数据（本地 JSON，位于 public/data/）。
 */
export async function fetchAnnouncements() {
  return fetchJson(buildUrl('data/announcement.json'));
}

/**
 * 一次性加载首页所需的全部数据。
 *
 * 关键改动：用 Promise.allSettled 替代 Promise.all。
 * 原因：Promise.all 是"全或无"——5 个请求里只要 1 个失败（哪怕只是公告数据这种非核心信息），
 * 整体就会 reject，导致商品、分类、店铺信息等核心数据全部拿不到，页面大面积空白。
 * allSettled 让每个数据源独立成功/失败，互不连累，
 * 单个数据源失败时用安全的空值兜底，页面骨架依然可以正常渲染。
 */
export async function fetchHomeData() {
  const results = await Promise.allSettled([
    fetchProducts(),
    fetchCategories(),
    fetchShop(),
    fetchBanners(),
    fetchAnnouncements(),
  ]);

  const [productsResult, categoriesResult, shopResult, bannersResult, announcementsResult] = results;

  const errors = [];

  function unwrap(result, label, fallback) {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error(`[SmartShop] ${label} 加载失败：`, result.reason);
    errors.push(label);
    return fallback;
  }

  const homeData = {
    products: unwrap(productsResult, '商品数据(Supabase)', []),
    categories: unwrap(categoriesResult, '分类数据', []),
    shop: unwrap(shopResult, '店铺信息', {}),
    banners: unwrap(bannersResult, '轮播数据', []),
    announcements: unwrap(announcementsResult, '公告数据', []),
  };

  if (errors.length) {
    homeData._partialErrors = errors;
  }

  return homeData;
}
