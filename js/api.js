// ==========================================================================
// api.js
// 商品数据改为从 Supabase 数据库读取；店铺信息、分类、轮播、公告
// 仍从本地 data/ 目录下的 JSON 文件读取。
// ==========================================================================

import { supabase } from './supabaseClient.js';

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
 * 把数据库字段（下划线命名）转换成前端一直在用的字段名（驼峰命名），
 * 这样 render.js / filter.js 等文件完全不用改。
 */
function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    aliases: row.aliases || [],
    price: row.price,
    originalPrice: row.original_price,
    discount: row.discount,
    category: row.category,
    brand: row.brand,
    specs: row.specs,
    barcode: row.barcode,
    stock: row.stock,
    image: row.image,
    images: row.images || [],
    description: row.description,
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
 * 读取所有商品数据（改为从 Supabase 读取）。
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
 * 读取分类数据（仍从本地 JSON 读取）。
 * @returns {Promise<Array<Object>>}
 */
export async function fetchCategories() {
  return fetchJson(buildUrl('data/categories.json'));
}

/**
 * 读取店铺信息（仍从本地 JSON 读取）。
 * @returns {Promise<Object>}
 */
export async function fetchShop() {
  return fetchJson(buildUrl('data/shop.json'));
}

/**
 * 读取轮播广告数据（仍从本地 JSON 读取）。
 * @returns {Promise<Array<Object>>}
 */
export async function fetchBanners() {
  return fetchJson(buildUrl('data/banner.json'));
}

/**
 * 读取店铺公告数据（仍从本地 JSON 读取）。
 * @returns {Promise<Array<Object>>}
 */
export async function fetchAnnouncements() {
  return fetchJson(buildUrl('data/announcement.json'));
}

/**
 * 一次性加载首页所需的全部数据，减少请求次数。
 * @returns {Promise<Object>}
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
