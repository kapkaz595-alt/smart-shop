# SmartShop 小商店数字货架

一个面向小型商店的数字货架网页系统。顾客通过手机扫码即可浏览商品、加入购物车、收藏商品、查看优惠并提交订单。

## 快速开始

本项目无需 Node 后端即可运行，使用 Vite 作为开发服务器：

```bash
pnpm install
pnpm run dev
```

生产构建：

```bash
pnpm run build
```

## 页面说明

- `index.html` — 首页，展示 Banner、公告、分类、商品、优惠专区、新品、热门、推荐
- `products.html` — 全部商品，支持分类筛选和搜索
- `cart.html` — 购物车，可修改数量、删除、清空、提交订单
- `favorites.html` — 我的收藏
- `orders.html` — 我的订单
- `admin/login.html` — 管理员登录
- `admin/dashboard.html` — 后台管理商品列表

## 数据说明

所有商品与店铺数据放在 `data/` 目录下的 JSON 文件中，运行时通过 Fetch API 读取：

- `data/products.json` — 商品数据
- `data/categories.json` — 分类数据
- `data/shop.json` — 店铺信息
- `data/banner.json` — 轮播广告
- `data/announcement.json` — 店铺公告

用户相关数据（购物车、收藏、浏览历史、订单等）保存在浏览器 localStorage。

## 技术栈

- HTML5 + CSS3 + JavaScript（ES6 Modules）
- Vite（开发服务器 + 构建）
- Fetch API
- localStorage（客户端持久化）
- PWA（manifest + Service Worker）

## 代码规范

- 模块化：每个 JS 文件只负责单一功能
- 命名规范：函数名、变量名使用语义化英文
- 注释完整：每个模块和主要函数都有中文注释
- 禁止重复代码：通用工具集中在 `utils.js`，渲染逻辑集中在 `render.js`
- 便于升级：api.js、storage.js 等模块是数据层边界，未来替换后端时只需修改这些文件

## 管理员账号（演示）

- 用户名：`admin`
- 密码：`admin123`

> 注意：这是纯前端演示账号，生产环境必须接入后端身份验证。

## 浏览器支持

- Chrome / Edge / Firefox / Safari 最新版本
- 响应式支持手机、平板、电脑
- 支持 PWA 添加到桌面

## 作者

SmartShop Team © 2026
