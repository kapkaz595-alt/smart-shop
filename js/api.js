// ==========================================================================
// api.js
// 负责从静态 JSON 文件读取数据，使用浏览器原生 Fetch API。
// 当前数据源：data/ 目录下的 JSON 文件。
// 以后升级后端（Node.js + Express + Supabase/Firebase）时，
// 只需修改这个文件的 URL 与请求逻辑，业务层无需改动。
// ==========================================================================

const BASE = import.meta.env.BASE_URL;

/**
 * 构建带部署前缀的 URL，确保在不同部署路径下都能访问。
 * @param {string} path
 */
function buildUrl(path) {
  return `${BASE}${path}`;
}

/**
 * 通用 JSON 读取辅助函数。
 * @param {string} url
 */
async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`请求失败：${url}，HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * 读取所有商品数据。
 * @returns {Promise<Array<Object>>}
 */
export async function fetchProducts() {
  return fetchJson(buildUrl('data/products.json'));
}

/**
 * 读取分类数据。
 * @returns {Promise<Array<Object>>}
 */
export async function fetchCategories() {
  return fetchJson(buildUrl('data/categories.json'));
}

/**
 * 读取店铺信息。
 * @returns {Promise<Object>}
 */
export async function fetchShop() {
  return fetchJson(buildUrl('data/shop.json'));
}

/**
 * 读取轮播广告数据。
 * @returns {Promise<Array<Object>>}
 */
export async function fetchBanners() {
  return fetchJson(buildUrl('data/banner.json'));
}

/**
 * 读取店铺公告数据。
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

