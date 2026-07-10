// ==========================================================================
// modal.js
// 负责商品详情弹窗：打开、关闭、图片轮播、收藏、加入购物车。
// ==========================================================================

import { resolveImagePath, formatPrice } from './utils.js';
import { getState, setState } from './state.js';

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
 * @param {Object} product
 * @param {Object} callbacks
 */
export function openProduct(product, callbacks = {}) {
  currentProduct = product;
  const inStock = product.stock > 0;
  const isFav = getState().favorites.includes(product.id);
  const shop = getState().shop || {};

  modalImage.src = resolveImagePath(product.image);
  modalImage.alt = product.name;
  modalCategory.textContent = product.category;
  modalTitle.textContent = product.name;
  modalBrand.textContent = `${product.brand} · ${product.specs}`;
  modalPrice.textContent = `${formatPrice(product.price)} ${shop.currencyName || '坚戈'}`;
  modalOriginalPrice.textContent = product.originalPrice > product.price ? `${formatPrice(product.originalPrice)} ${shop.currencyName || '坚戈'}` : '';
  modalDiscount.textContent = product.discount > 0 ? `-${Math.round(product.discount * 100)}%` : '';
  modalDiscount.hidden = product.discount <= 0;
  modalStock.textContent = inStock ? `库存：${product.stock} 件` : '暂时缺货';
  modalStock.className = `modal-stock ${inStock ? 'in-stock' : 'out-stock'}`;
  modalDesc.textContent = product.description || '暂无商品介绍。';

  modalFeatures.innerHTML = product.features && product.features.length
    ? `<ul>${product.features.map((f) => `<li>${f}</li>`).join('')}</ul>`
    : '';

  modalMeta.innerHTML = `
    <div class="modal-meta-item"><div class="modal-meta-label">条形码</div><div class="modal-meta-value">${product.barcode || '-'}</div></div>
    <div class="modal-meta-item"><div class="modal-meta-label">生产日期</div><div class="modal-meta-value">${product.productionDate || '-'}</div></div>
    <div class="modal-meta-item"><div class="modal-meta-label">保质期</div><div class="modal-meta-value">${product.shelfLife || '-'}</div></div>
    <div class="modal-meta-item"><div class="modal-meta-label">厂家</div><div class="modal-meta-value">${product.manufacturer || '-'}</div></div>
  `;

  modalFavorite.innerHTML = `${isFav ? '❤️' : '🤍'} ${isFav ? '已收藏' : '收藏'}`;
  modalFavorite.classList.toggle('active', isFav);
  modalAddCart.disabled = !inStock;
  modalAddCart.textContent = inStock ? '🛒 加入购物车' : '暂时缺货';

  renderGallery(product.images || [product.image]);

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  if (callbacks.onView) callbacks.onView(product);
}

/**
 * 渲染弹窗内的小图轮播。
 * @param {Array<string>} images
 */
function renderGallery(images) {
  if (!modalGallery) return;
  modalGallery.innerHTML = images
    .map(
      (src, index) => `
      <img class="${index === 0 ? 'active' : ''}" src="${resolveImagePath(src)}" alt="" data-src="${resolveImagePath(src)}" />
    `,
    )
    .join('');

  modalGallery.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => {
      modalImage.src = img.dataset.src;
      modalGallery.querySelectorAll('img').forEach((i) => i.classList.remove('active'));
      img.classList.add('active');
    });
  });
}

/**
 * 关闭弹窗。
 */
export function closeProduct() {
  modal.hidden = true;
  document.body.style.overflow = '';
  currentProduct = null;
}

// 关闭事件绑定
modalClose.addEventListener('click', closeProduct);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeProduct();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeProduct();
});

export function getCurrentProduct() {
  return currentProduct;
}

