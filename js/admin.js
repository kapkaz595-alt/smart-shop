// ==========================================================================
// admin.js
// 后台管理：接入 Supabase Auth、商品真正的 CRUD、图片上传至 Supabase Storage。
// ==========================================================================

import { supabase } from './supabaseClient.js';
import { setState } from './state.js';
import { showToast } from './utils.js';
import { KEYS, setJson, getJson } from './storage.js'; // 保留供其他地方可能需要的状态

/**
 * 映射前端驼峰命名的对象到数据库下划线字段
 */
function mapProductToRow(product) {
  return {
    name: product.name,
    aliases: product.aliases,
    price: product.price,
    original_price: product.originalPrice,
    discount: product.discount,
    category: product.category,
    brand: product.brand,
    specs: product.specs,
    barcode: product.barcode,
    stock: product.stock,
    image: product.image,
    images: product.images,
    description: product.description,
    features: product.features,
    nutrition: product.nutrition,
    production_date: product.productionDate,
    shelf_life: product.shelfLife,
    manufacturer: product.manufacturer,
    tags: product.tags,
    is_new: product.isNew,
    is_hot: product.isHot,
    is_promotion: product.isPromotion,
    promotion_type: product.promotionType,
  };
}

/**
 * 将数据库下划线字段转换为前端驼峰命名
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
    promotion_type: row.promotion_type,
    views: row.views,
    clicks: row.clicks,
    favorites: row.favorites,
  };
}

/**
 * 管理员登录（使用 Supabase Auth 邮箱密码登录）。
 * @param {string} email 
 * @param {string} password 
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    showToast(`登录失败：${error.message}`);
    return false;
  }

  setJson(KEYS.ADMIN_SESSION, true);
  setState({ isAdmin: true });
  showToast('登录成功');
  return true;
}

/**
 * 检查是否已登录（检查 Supabase 当前 Session 是否有效）。
 */
export async function checkAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  const isAdmin = !!session;
  setJson(KEYS.ADMIN_SESSION, isAdmin);
  setState({ isAdmin });
  return isAdmin;
}

/**
 * 退出登录。
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showToast(`退出失败：${error.message}`);
    return;
  }
  setJson(KEYS.ADMIN_SESSION, false);
  setState({ isAdmin: false });
  showToast('已退出登录');
}

/**
 * 渲染后台商品列表（从 Supabase 实时读取数据库）。
 */
export async function renderAdminProducts() {
  const tbody = document.getElementById('admin-product-list');
  if (!tbody) return;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    tbody.innerHTML = products
      .map((p) => {
        // 如果图片是普通的相对路径或云端绝对URL，按需拼接
        const imgUrl = p.image.startsWith('http') ? p.image : `${import.meta.env.BASE_URL}${p.image}`;
        return `
          <tr data-id="${p.id}">
            <td><img src="${imgUrl}" alt="${p.name}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;" /></td>
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
        `;
      })
      .join('');

    tbody.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;

        // 🛠️ 【已修复】修改为当前目录相对路径跳转，完美解决 GitHub Pages 环境下的 404
        if (action === 'edit') window.location.href = `./product-edit.html?id=${id}`;

        if (action === 'delete') {
          if (confirm('确认删除该商品？')) {
            deleteProduct(id);
          }
        }
      });
    });
  } catch (error) {
    showToast(`加载商品列表失败: ${error.message}`);
  }
}

/**
 * 新增商品（保存到 Supabase 数据库）。
 * @param {Object} product 前端传入的驼峰命名商品对象
 * @returns {Promise<boolean>} 是否成功
 */
export async function addProduct(product) {
  const rowData = mapProductToRow(product);
  const { data, error } = await supabase
    .from('products')
    .insert([rowData])
    .select();

  if (error) {
    showToast(`添加商品失败：${error.message}`);
    console.error('Supabase 添加商品失败详情:', error);
    return false;
  }

  showToast('商品添加成功！');
  renderAdminProducts();
  return true;
}

/**
 * 编辑/更新商品。
 * @param {number} id 
 * @param {Object} product 
 * @returns {Promise<boolean>} 是否成功
 */
export async function updateProduct(id, product) {
  const rowData = mapProductToRow(product);
  const { data, error } = await supabase
    .from('products')
    .update(rowData)
    .eq('id', id)
    .select();

  if (error) {
    showToast(`更新商品失败：${error.message}`);
    console.error('Supabase 更新商品失败详情:', error);
    return false;
  }

  showToast('商品更新成功！');
  return true;
}

/**
 * 删除商品（从 Supabase 数据库中删除）。
 * @param {number} id
 */
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    showToast(`删除商品失败：${error.message}`);
    return;
  }

  showToast('商品已从数据库删除');
  renderAdminProducts();
}

/**
 * 真正的图片上传：将 File 对象上传到 Supabase Storage 存储桶 'products' 中。
 * @param {File} file
 * @returns {Promise<string>} 返回图片的公开 URL 路径
 */
export async function uploadImage(file) {
  // 生成唯一文件名，防止重名覆盖
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  // 上传到名为 'products' 的存储桶
  const { data, error } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (error) {
    showToast(`图片上传失败: ${error.message}`);
    throw error;
  }

  // 获取公开访问的 URL
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return publicUrl;
}

// 废弃原先的本地缓存加载
export function loadAdminProducts(initialProducts = []) { return []; }
export function initAdminCache(products) { return; }
