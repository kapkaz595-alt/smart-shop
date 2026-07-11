// ==========================================================================
// orders.js
// 订单管理：提交订单、读取订单、渲染订单列表、更新订单状态。
// 当前无需支付，订单提交后通过 WhatsApp 发送给店主，配合 Kaspi 二维码收款。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';
import { generateOrderNumber, showToast } from './utils.js';
import { calculateTotal, calculateCount } from './cart.js';

// ⚠️ 请替换成店铺真实 WhatsApp 号码：只写数字，带国家区号，不要加 + 号、空格、横杠
// 例如哈萨克斯坦号码 +7 777 123 4567，这里应写成 '77771234567'
const SHOP_WHATSAPP_NUMBER = '00000000000';

/**
 * 从购物车创建订单。
 * @param {Object} formData
 * @param {Array<Object>} cart
 */
export function createOrder(formData, cart) {
  if (!cart.length) {
    showToast('购物车为空，无法提交订单');
    return null;
  }

  const order = {
    id: generateOrderNumber(),
    items: cart.map((item) => ({ ...item })),
    total: calculateTotal(cart),
    count: calculateCount(cart),
    customerName: formData.customerName || '',
    phone: formData.phone || '',
    note: formData.note || '',
    deliveryType: formData.deliveryType || 'self',
    status: 'pending',
    createdAt: Date.now(),
  };

  const orders = getJson(KEYS.ORDERS, []);
  orders.unshift(order);
  setJson(KEYS.ORDERS, orders);
  setState({ orders });

  showToast(`订单提交成功：${order.id}`);
  return order;
}

/**
 * 把订单内容拼成一段可读文本，用于发送到 WhatsApp。
 * @param {Object} order
 */
export function buildOrderMessage(order) {
  const deliveryLabel = order.deliveryType === 'delivery' ? '配送' : '到店自取';
  const itemLines = order.items
    .map((item) => `- ${item.name} x${item.quantity} - ${item.price * item.quantity} 坚戈`)
    .join('\n');

  return [
    `新订单 #${order.id}`,
    `姓名：${order.customerName || '未填写'}`,
    `电话：${order.phone || '未填写'}`,
    `配送方式：${deliveryLabel}`,
    order.note ? `备注：${order.note}` : '',
    '',
    '商品清单：',
    itemLines,
    '',
    `合计：${order.total} 坚戈`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * 生成 WhatsApp 跳转链接（消息内容已预填）。
 * @param {Object} order
 */
export function getWhatsAppOrderUrl(order) {
  const message = buildOrderMessage(order);
  return `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * 打开 WhatsApp，把订单信息发送给店主。
 * @param {Object} order
 */
export function sendOrderToWhatsApp(order) {
  const url = getWhatsAppOrderUrl(order);
  window.open(url, '_blank');
}

/**
 * 加载订单列表。
 */
export function loadOrders() {
  return getJson(KEYS.ORDERS, []);
}

/**
 * 更新订单状态。
 * @param {string} orderId
 * @param {string} status
 */
export function updateOrderStatus(orderId, status) {
  const orders = getJson(KEYS.ORDERS, []).map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  setJson(KEYS.ORDERS, orders);
  setState({ orders });
}

/**
 * 取消订单。
 * @param {string} orderId
 */
export function cancelOrder(orderId) {
  updateOrderStatus(orderId, 'cancelled');
  showToast('订单已取消');
}

/**
 * 渲染订单列表。
 * @param {Array<Object>} orders
 */
export function renderOrders(orders) {
  const container = document.getElementById('orders-list');
  if (!container) return;

  if (!orders.length) {
    container.innerHTML = `<p class="empty-state" data-i18n="emptyOrders">还没有订单。</p>`;
    return;
  }

  container.innerHTML = orders
    .map((order) => {
      const statusMap = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消',
      };
      const statusClass = {
        pending: 'pending',
        confirmed: 'confirmed',
        completed: 'completed',
        cancelled: 'cancelled',
      }[order.status] || 'pending';

      const date = new Date(order.createdAt).toLocaleString('zh-CN');
      const items = order.items
        .map((item) => `<p class="list-card-meta">${item.name} × ${item.quantity}</p>`)
        .join('');

      return `
        <div class="list-card order-card">
          <div class="list-card-body">
            <div class="list-card-meta" style="font-weight:700;">订单编号：${order.id}</div>
            <div class="list-card-meta">下单时间：${date}</div>
            <div class="list-card-meta">顾客：${order.customerName || '-'} / ${order.phone || '-'}</div>
            ${items}
            <p class="list-card-price">合计：${order.total} 坚戈</p>
            <p class="list-card-meta">配送方式：${order.deliveryType === 'delivery' ? '配送' : '自提'}</p>
          </div>
          <div class="list-card-actions" style="flex-direction:column;gap:8px;">
            <span class="status-badge ${statusClass}">${statusMap[order.status]}</span>
            ${order.status === 'pending' ? `<button type="button" class="btn btn-secondary" data-action="cancel" data-id="${order.id}">取消</button>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('[data-action="cancel"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cancelOrder(btn.dataset.id);
      renderOrders(loadOrders());
    });
  });
}
