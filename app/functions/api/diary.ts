// Cloudflare Pages Function：双人日记/留言，KV 存储 + 共享密码
// 绑定：KV namespace 名为 DIARY；环境变量 DIARY_PASSWORD 为共享密码

interface Entry {
  id: string;
  type: 'diary' | 'message';
  author: string;
  content: string;
  image?: string;
  createdAt: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

function authed(request: Request, env: any): boolean {
  const pwd = env.DIARY_PASSWORD;
  if (!pwd) return false;
  return request.headers.get('X-Diary-Password') === pwd;
}

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  if (!authed(request, env)) return json({ error: 'unauthorized' }, 401);
  const raw = await (env as any).DIARY.get('entries');
  const entries: Entry[] = raw ? JSON.parse(raw) : [];
  return json({ entries: entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
};

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!authed(request, env)) return json({ error: 'unauthorized' }, 401);
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
  const { type, author, content } = body || {};
  if (!['diary', 'message'].includes(type)) return json({ error: 'type 必须是 diary 或 message' }, 400);
  if (!author || String(author).trim().length === 0 || String(author).length > 20) return json({ error: '署名必填且不超过20字' }, 400);
  if (!content || String(content).trim().length === 0 || String(content).length > 5000) return json({ error: '内容必填且不超过5000字' }, 400);
  if (body.image && !String(body.image).startsWith('/api/file/')) return json({ error: '图片路径不合法' }, 400);

  const raw = await (env as any).DIARY.get('entries');
  const entries: Entry[] = raw ? JSON.parse(raw) : [];
  const entry: Entry = {
    id: crypto.randomUUID(),
    type,
    author: String(author).trim(),
    content: String(content).trim(),
    image: body.image || undefined,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  // 上限 1000 条，超出淘汰最旧
  if (entries.length > 1000) entries.splice(0, entries.length - 1000);
  await (env as any).DIARY.put('entries', JSON.stringify(entries));
  return json({ entry }, 201);
};

// 登录校验：密码正确即返回 ok（前端将密码保存在 sessionStorage，随请求头发送）
export const onRequestHead: PagesFunction = async ({ request, env }) => {
  return new Response(null, { status: authed(request, env) ? 204 : 401 });
};
