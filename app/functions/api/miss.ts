// 想你了：按天计数，双方可见。免密（私有两人站）
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

function todayKey(): string {
  // 用 UTC+8 的日期作为计数日
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  return now.toISOString().slice(0, 10);
}

export const onRequestGet: PagesFunction = async ({ env }) => {
  const raw = await env.DIARY.get('miss');
  const data = raw ? JSON.parse(raw) : null;
  const today = todayKey();
  return json({ count: data && data.date === today ? data.count : 0 });
};

export const onRequestPost: PagesFunction = async ({ env }) => {
  const raw = await env.DIARY.get('miss');
  const data = raw ? JSON.parse(raw) : null;
  const today = todayKey();
  const count = (data && data.date === today ? data.count : 0) + 1;
  await env.DIARY.put('miss', JSON.stringify({ date: today, count }));
  return json({ count }, 201);
};
