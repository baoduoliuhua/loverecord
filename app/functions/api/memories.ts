// 在线回忆 API：GET 公开读取；POST/PUT/DELETE 需共享密码
// KV key: memories → JSON 数组
interface Memory {
  id: string;
  title: string;
  date: string;
  sortDate: string;
  scene: string;
  image?: string;
  images?: string[];
  alt?: string;
  city?: string;
  content: string;
  createdAt: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const SCENES = ['default', 'seaside', 'mountain', 'city', 'spring', 'summer', 'autumn', 'winter', 'rain', 'fireworks', 'starlight'];

function authed(request: Request, env: any): boolean {
  return !!env.DIARY_PASSWORD && request.headers.get('X-Diary-Password') === env.DIARY_PASSWORD;
}

async function readAll(env: any): Promise<Memory[]> {
  const raw = await env.DIARY.get('memories');
  return raw ? JSON.parse(raw) : [];
}

function validate(body: any): string | null {
  if (!body.title || String(body.title).length > 50) return '标题必填且不超过50字';
  if (!body.date || String(body.date).length > 20) return '显示日期必填';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.sortDate || '')) return 'sortDate 需为 YYYY-MM-DD';
  if (!SCENES.includes(body.scene)) return '场景不合法';
  if (body.image && !String(body.image).startsWith('/api/file/') && !String(body.image).startsWith('/assets/')) return '图片路径不合法';
  if (body.images) {
    if (!Array.isArray(body.images) || body.images.length > 12) return '图片最多 12 张';
    for (const u of body.images) {
      if (!String(u).startsWith('/api/file/') && !String(u).startsWith('/assets/')) return '图片路径不合法';
    }
  }
  if (body.content && String(body.content).length > 5000) return '正文不超过5000字';
  if (body.city && String(body.city).length > 20) return '城市名不超过20字';
  return null;
}

export const onRequestGet: PagesFunction = async ({ env }) => {
  const list = await readAll(env);
  return json({ memories: list.sort((a, b) => a.sortDate.localeCompare(b.sortDate)) });
};

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!authed(request, env)) return json({ error: 'unauthorized' }, 401);
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
  const err = validate(body);
  if (err) return json({ error: err }, 400);

  const list = await readAll(env);
  const item: Memory = {
    id: crypto.randomUUID(),
    title: String(body.title).trim(),
    date: String(body.date).trim(),
    sortDate: body.sortDate,
    scene: body.scene,
    image: body.image || undefined,
    images: Array.isArray(body.images) && body.images.length ? body.images : undefined,
    alt: String(body.alt || '').slice(0, 100),
    content: String(body.content || '').trim(),
    city: body.city ? String(body.city).trim() : undefined,
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  await env.DIARY.put('memories', JSON.stringify(list));
  return json({ memory: item }, 201);
};

export const onRequestPut: PagesFunction = async ({ request, env }) => {
  if (!authed(request, env)) return json({ error: 'unauthorized' }, 401);
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
  if (!body.id) return json({ error: '缺少 id' }, 400);
  const err = validate(body);
  if (err) return json({ error: err }, 400);

  const list = await readAll(env);
  const idx = list.findIndex(m => m.id === body.id);
  if (idx < 0) return json({ error: '回忆不存在' }, 404);
  list[idx] = {
    ...list[idx],
    title: String(body.title).trim(),
    date: String(body.date).trim(),
    sortDate: body.sortDate,
    scene: body.scene,
    image: body.image || undefined,
    images: Array.isArray(body.images) && body.images.length ? body.images : undefined,
    alt: String(body.alt || '').slice(0, 100),
    content: String(body.content || '').trim(),
    city: body.city ? String(body.city).trim() : undefined,
  };
  await env.DIARY.put('memories', JSON.stringify(list));
  return json({ memory: list[idx] });
};

export const onRequestDelete: PagesFunction = async ({ request, env }) => {
  if (!authed(request, env)) return json({ error: 'unauthorized' }, 401);
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return json({ error: '缺少 id' }, 400);
  const list = await readAll(env);
  const next = list.filter(m => m.id !== id);
  if (next.length === list.length) return json({ error: '回忆不存在' }, 404);
  await env.DIARY.put('memories', JSON.stringify(next));
  return json({ ok: true });
};
