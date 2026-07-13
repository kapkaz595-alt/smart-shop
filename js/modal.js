// ==========================================================================
// modal.js (已修复：增加元素存在性校验，防止报错)
// ==========================================================================

import { resolveImagePath, formatPrice } from './utils.js';
import { getState, setState } from './state.js';

// 获取 DOM 元素
const modal = document.getElementById('product-modal');
const modalImage = document.getElementById('modal-image');
const modalGallery = document.getElementById('modal-gallery');
const modalCategory = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalBrand = document.getElementById('modal-brand');
const modalPrice = document.getElementById('modal-price');
const modalOriginalPrice = document.getElementById('modal-original-price');
const modalDiscount = document.getElementById('modal-discount');
const modalStock = document.getElementById('modal-stock');
const modalDesc = document.getElementById('modal-desc');
const modalFeatures = document.getElementById('modal-features');
const modalMeta = document.getElementById('modal-meta');
const modalFavorite = document.getElementById('modal-favorite');
const modalAddCart = document.getElementById('modal-add-cart');
const modalClose = document.getElementById('modal-close');

let currentProduct = null;

/**
 * 打开商品详情弹窗。
 */
export function openProduct(product, callbacks = {}) {
  if (!modal) return; // 安全检查：如果页面没弹窗，直接返回

  currentProduct = product;
  const inStock = product.stock > 0;
  const isFav = getState().favorites.includes(product.id);
  const shop = getState().shop || {};

  if (modalImage) modalImage.src = resolveImagePath(product.image);
  if (modalCategory) modalCategory.textContent = product.category;
  if (modalTitle) modalTitle.textContent = product.name;
  if (modalBrand) modalBrand.textContent = `${product.brand} · ${product.specs}`;
  if (modalPrice) modalPrice.textContent = `${formatPrice(product.price)} ${shop.currencyName || '坚戈'}`;
  if (modalOriginalPrice) modalOriginalPrice.textContent = product.originalPrice > product.price ? `${formatPrice(product.originalPrice)} ${shop.currencyName || '坚戈'}` : '';
  if (modalDiscount) {
    modalDiscount.textContent = product.discount > 0 ? `-${Math.round(product.discount * 100)}%` : '';
    modalDiscount.hidden = product.discount <= 0;
  }
  if (modalStock) {
    modalStock.textContent = inStock ? `库存：${product.stock} 件` : '暂时缺货';
    modalStock.className = `modal-stock ${inStock ? 'in-stock' : 'out-stock'}`;
  }
  if (modalDesc) modalDesc.textContent = product.description || '暂无商品介绍。';

  if (modalFeatures) {
    modalFeatures.innerHTML = product.features && product.features.length
      ? `<ul>${product.features.map((f) => `<li>${f}</li>`).join('')}</ul>`
      : '';
  }

  if (modalMeta) {
    modalMeta.innerHTML = `
      <div class="modal-meta-item"><div class="modal-meta-label">条形码</div><div class="modal-meta-value">${product.barcode || '-'}</div></div>
      <div class="modal-meta-item"><div class="modal-meta-label">生产日期</div><div class="modal-meta-value">${product.productionDate || '-'}</div></div>
      <div class="modal-meta-item"><div class="modal-meta-label">保质期</div><div class="modal-meta-value">${product.shelfLife || '-'}</div></div>
      <div class="modal-meta-item"><div class="modal-meta-label">厂家</div><div class="modal-meta-value">${product.manufacturer || '-'}</div></div>
    `;
  }

  if (modalFavorite) {
    modalFavorite.innerHTML = `${isFav ? '❤️' : '🤍'} ${isFav ? '已收藏' : '收藏'}`;
    modalFavorite.classList.toggle('active', isFav);
  }
  if (modalAddCart) {
    modalAddCart.disabled = !inStock;
    modalAddCart.textContent = inStock ? '🛒 加入购物车' : '暂时缺货';
  }

  renderGallery(product.images || [product.image]);

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  if (callbacks.onView) callbacks.onView(product);
}

/**
 * 渲染弹窗内的小图轮播。
 */
function renderGallery(images) {
  if (!modalGallery) return;
  modalGallery.innerHTML = images
    .map((src, index) => `<img class="${index === 0 ? 'active' : ''}" src="${resolveImagePath(src)}" alt="" data-src="${resolveImagePath(src)}" />`)
    .join('');

  modalGallery.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => {
      if (modalImage) modalImage.src = img.dataset.src;
      modalGallery.querySelectorAll('img').forEach((i) => i.classList.remove('active'));
      img.classList.add('active');
    });
  });
}

/**
 * 关闭弹窗。
 */
export function closeProduct() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  currentProduct = null;
}

// 安全地绑定事件：仅在元素存在时绑定
if (modalClose) modalClose.addEventListener('click', closeProduct);
if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeProduct();
  });
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && !modal.hidden) closeProduct();
});

export function getCurrentProduct() {
  return currentProduct;
}
