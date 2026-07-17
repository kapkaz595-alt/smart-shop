// ==========================================================================
// orders.js
// 订单管理：提交订单到 Supabase、按本设备记录的订单 ID 查询、渲染订单列表、更新订单状态。
// 不要求顾客登录，user_id 统一为 null；本设备订单 ID 列表存 localStorage，
// 用于换设备无法查看历史（预期行为），同设备刷新/换浏览器 tab 都能看到最新状态。
// ==========================================================================

import { supabase } from './supabaseClient.js';
import { KEYS, getJson, setJson } from './storage.js';
import { getState, setState } from './state.js';
import { showToast } from './utils.js';
import { calculateTotal } from './cart.js';

const ORDER_EXPIRES_MINUTES = 30;

/**
 * 计算购物车原价总额（如果商品有 originalPrice 就用它，没有就退回 price）。
 * @param {Array<Object>} cart
 */
function calculateOriginalTotal(cart) {
  return cart.reduce((sum, item) => {
    const unitOriginal = item.originalPrice > 0 ? item.originalPrice : item.price;
    return sum + unitOriginal * item.quantity;
  }, 0);
}

/**
 * 把 Supabase 返回的订单行（下划线命名）转换成前端使用的驼峰命名对象，
 * 字段名和原来本地版本保持一致，renderOrders 等函数不用改。
 */
function mapOrderRow(row) {
  return {
    id: row.id,
    items: row.items || [],
    total: Number(row.final_amount) || 0,
    originalTotal: Number(row.original_amount) || 0,
    count: (row.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    customerName: row.customer_name || '',
    phone: row.customer_phone || '',
    note: row.note || '',
    deliveryType: row.delivery_method || 'self',
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
  };
}

/**
 * 从购物车创建订单，写入 Supabase 的 orders 表。
 * 现在是异步函数：调用方必须 await，否则拿到的是 Promise 而不是订单数据。
 * @param {Object} formData
 * @param {Array<Object>} cart
 */
export async function createOrder(formData, cart) {
  if (!cart.length) {
    showToast('购物车为空，无法提交订单');
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ORDER_EXPIRES_MINUTES * 60 * 1000);

  const orderRow = {
    user_id: null,
    customer_name: formData.customerName || '',
    customer_phone: formData.phone || '',
    delivery_method: formData.deliveryType || 'self',
    note: formData.note || '',
    original_amount: calculateOriginalTotal(cart),
    final_amount: calculateTotal(cart),
    status: 'pending',
    items: cart.map((item) => ({ ...item })),
    expires_at: expiresAt.toISOString(),
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([orderRow])
    .select()
    .single();

  if (error) {
    console.error('Supabase 订单写入失败详情:', error);
    showToast(`订单提交失败：${error.message}`);
    return null;
  }

  // 把订单 ID 记录到本设备 localStorage，供 loadOrders 按 ID 查询用
  const localIds = getJson(KEYS.ORDERS, []);
  localIds.unshift(data.id);
  setJson(KEYS.ORDERS, localIds);

  const order = mapOrderRow(data);
  setState({ orders: [order, ...getState().orders] });

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

// ⚠️ 请替换成店铺真实 WhatsApp 号码：只写数字，带国家区号，不要加 + 号、空格、横杠
const SHOP_WHATSAPP_NUMBER = '00000000000';

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
 * 加载本设备的订单列表（按 localStorage 记录的订单 ID，去 Supabase 查询最新详情）。
 * 现在是异步函数：调用方必须 await。
 */
export async function loadOrders() {
  const localIds = getJson(KEYS.ORDERS, []);
  if (!localIds.length) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('id', localIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase 订单查询失败详情:', error);
    showToast(`订单加载失败：${error.message}`);
    return [];
  }

  const orders = (data || []).map(mapOrderRow);
  setState({ orders });
  return orders;
}

/**
 * 更新订单状态（写入 Supabase）。
 * @param {string} orderId
 * @param {string} status
 */
export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Supabase 订单状态更新失败详情:', error);
    showToast(`订单状态更新失败：${error.message}`);
    return false;
  }

  return true;
}

/**
 * 取消订单。
 * @param {string} orderId
 */
export async function cancelOrder(orderId) {
  const success = await updateOrderStatus(orderId, 'cancelled');
  if (success) showToast('订单已取消');
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
        pending: 'Расталуды күтуде',
        confirmed: 'Расталды',
        completed: 'Аяқталды',
        cancelled: 'Бас тартылды',
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
            <div class="list-card-meta" style="font-weight:700;">Тапсырыс нөмірі：${order.id}</div>
            <div class="list-card-meta">Тапсырыс уақыты：${date}</div>
            <div class="list-card-meta">Клент：${order.customerName || '-'} / ${order.phone || '-'}</div>
            ${items}
            <p class="list-card-price">Жалпы сома：${order.total} ТГ</p>
            <p class="list-card-meta">Жеткізу тәсілі：${order.deliveryType === 'delivery' ? 'Жеткізу ' : 'Алып кету '}</p>
          </div>
          <div class="list-card-actions" style="flex-direction:column;gap:8px;">
            <span class="status-badge ${statusClass}">${statusMap[order.status]}</span>
            ${order.status === 'pending' ? `<button type="button" class="btn btn-secondary" data-action="cancel" data-id="${order.id}">Бас тарту</button>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('[data-action="cancel"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await cancelOrder(btn.dataset.id);
      renderOrders(await loadOrders());
    });
  });
}
