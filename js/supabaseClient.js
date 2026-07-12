// ==========================================================================
// supabaseClient.js
// 初始化 Supabase 客户端，供 api.js / admin.js 调用。
// URL 和 Key 是"公开可用"的凭证，配合数据库的行级安全规则（RLS）
// 保证真正的读写权限控制，暴露在前端代码里是 Supabase 官方设计的正常用法。
// ==========================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://snjriobsrgsbhxklbwiu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gbH5UXBibf0ZWfWn1Mm7Sg_os2i4HNW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
