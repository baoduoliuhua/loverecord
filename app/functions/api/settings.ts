// 站点设置：情侣名/在一起日期/纪念日，KV 存储
// GET 公开读取；POST 需共享密码
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

export const onRequestGet: PagesFunction = async ({ env }) => {
  const raw = await env.DIARY.get('settings');
  return json(raw ? JSON.parse(raw) : {});
};

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!env.DIARY_PASSWORD || request.headers.get('X-Diary-Password') !== env.DIARY_PASSWORD) {
    return json({ error: 'unauthorized' }, 401);
  }
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }

  const settings: any = {};
  if (body.coupleName !== undefined) {
    if (!body.coupleName || String(body.coupleName).length > 30) return json({ error: '情侣名必填且不超过30字' }, 400);
    settings.coupleName = String(body.coupleName).trim();
  }
  if (body.startDate !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) return json({ error: '在一起日期需为 YYYY-MM-DD' }, 400);
    settings.startDate = body.startDate;
  }
  if (body.anniversary !== undefined) {
    if (!Array.isArray(body.anniversary) || body.anniversary.length > 20) return json({ error: '纪念日最多20个' }, 400);
    for (const a of body.anniversary) {
      if (!a.title || String(a.title).length > 20) return json({ error: '纪念日名称必填且不超过20字' }, 400);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date || '')) return json({ error: '纪念日日期需为 YYYY-MM-DD' }, 400);
    }
    settings.anniversary = body.anniversary.map((a: any) => ({ title: String(a.title).trim(), date: a.date }));
  }

  const raw = await env.DIARY.get('settings');
  const merged = { ...(raw ? JSON.parse(raw) : {}), ...settings };
  await env.DIARY.put('settings', JSON.stringify(merged));
  return json(merged);
};
