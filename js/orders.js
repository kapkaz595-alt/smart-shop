// ==========================================================================
// orders.js
// 订单管理：提交订单、读取订单、渲染订单列表、更新订单状态。
// 当前无需支付，点击提交即可生成订单。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';
import { generateOrderNumber, showToast } from './utils.js';
import { calculateTotal, calculateCount } from './cart.js';

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

