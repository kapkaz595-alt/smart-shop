// ==========================================================================
// admin.js
// 后台管理：登录校验、商品 CRUD、订单状态管理、图片上传（前端模拟）。
// 当前使用本地 localStorage 模拟管理员状态与数据编辑。
// 以后可连接后端数据库。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';
import { showToast } from './utils.js';

const PRODUCTS_CACHE_KEY = 'smartshop:productsCache';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // 仅用于演示，生产环境必须后端验证

/**
 * 管理员登录。
 * @param {string} username
 * @param {string} password
 */
export function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    setJson(KEYS.ADMIN_SESSION, true);
    setState({ isAdmin: true });
    showToast('登录成功');
    return true;
  }
  showToast('用户名或密码错误');
  return false;
}

/**
 * 检查是否已登录。
 */
export function checkAdmin() {
  const isAdmin = getJson(KEYS.ADMIN_SESSION, false);
  setState({ isAdmin });
  return isAdmin;
}

/**
 * 退出登录。
 */
export function logout() {
  setJson(KEYS.ADMIN_SESSION, false);
  setState({ isAdmin: false });
  showToast('已退出登录');
}

/**
 * 渲染后台商品列表。
 * @param {Array<Object>} products
 */
/**
 * 加载后台商品缓存（以本地缓存为管理数据源）。
 * 如果缓存为空，则使用从 JSON 初始化传来的数据。
 */
export function loadAdminProducts(initialProducts = []) {
  const cached = getJson(PRODUCTS_CACHE_KEY, []);
  if (cached.length) return cached;
  if (initialProducts.length) {
    setJson(PRODUCTS_CACHE_KEY, initialProducts);
  }
  return initialProducts;
}

/**
 * 渲染后台商品列表（从缓存读取）。
 */
export function renderAdminProducts() {
  const tbody = document.getElementById('admin-product-list');
  if (!tbody) return;

  const products = getJson(PRODUCTS_CACHE_KEY, []);

  tbody.innerHTML = products
    .map(
      (p) => `
      <tr data-id="${p.id}">
        <td><img src="${import.meta.env.BASE_URL}${p.image}" alt="${p.name}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;" /></td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.price}</td>
        <td>${p.stock}</td>
        <td><span class="status-badge ${p.stock > 0 ? 'completed' : 'cancelled'}">${p.stock > 0 ? '有货' : '缺货'}</span></td>
        <td>
          <button type="button" class="btn btn-secondary" data-action="edit" data-id="${p.id}">编辑</button>
          <button type="button" class="btn btn-danger" data-action="delete" data-id="${p.id}">删除</button>
        </td>
      </tr>
    `,
    )
    .join('');

  tbody.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === 'edit') window.location.href = `product-edit.html?id=${id}`;
      if (action === 'delete') {
        if (confirm('确认删除该商品？')) {
          deleteProduct(id);
        }
      }
    });
  });
}

/**
 * 初始化后台商品缓存。
 * 在 Dashboard 加载时调用一次，将 JSON 数据写入缓存作为管理数据源。
 * @param {Array<Object>} products
 */
export function initAdminCache(products) {
  setJson(PRODUCTS_CACHE_KEY, products);
}

/**
 * 新增商品（保存到缓存中）。
 * 由于当前是静态 JSON，这里仅演示数据结构，刷新页面会重置。
 * 以后需配合后端持久化。
 * @param {Object} product
 */
export function addProduct(product) {
  const products = getJson(PRODUCTS_CACHE_KEY, []);
  const newProduct = { ...product, id: Date.now() };
  products.push(newProduct);
  setJson(PRODUCTS_CACHE_KEY, products);
  showToast('商品已添加（当前为本地缓存，刷新后需同步后端）');
  renderAdminProducts();
}

/**
 * 删除商品（从缓存中删除）。
 * @param {number} id
 */
export function deleteProduct(id) {
  const products = getJson(PRODUCTS_CACHE_KEY, []).filter((p) => p.id !== id);
  setJson(PRODUCTS_CACHE_KEY, products);
  showToast('商品已删除（当前为本地缓存）');
  renderAdminProducts();
}

/**
 * 模拟图片上传：将 File 对象转成 base64。
 * @param {File} file
 */
export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { ADMIN_USERNAME, ADMIN_PASSWORD };

