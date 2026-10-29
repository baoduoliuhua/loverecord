// 年度统计：只返回数量，不涉及内容
export const onRequestGet: PagesFunction = async ({ env }) => {
  const raw = await env.DIARY.get('entries');
  const entries = raw ? JSON.parse(raw) : [];
  return new Response(JSON.stringify({ diaryCount: entries.length }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
