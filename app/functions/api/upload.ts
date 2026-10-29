// 照片上传：POST multipart/form-data（字段 file），存 R2，返回 /api/file/<key>
// 绑定：R2 bucket 名为 BUCKET；需共享密码
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};
const MAX_SIZE = 100 * 1024 * 1024; // 100MB（Cloudflare 单请求上限）

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!env.DIARY_PASSWORD || request.headers.get('X-Diary-Password') !== env.DIARY_PASSWORD) {
    return json({ error: 'unauthorized' }, 401);
  }
  let form: FormData;
  try { form = await request.formData(); } catch { return json({ error: 'bad request' }, 400); }
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: '缺少文件' }, 400);
  const ext = TYPES[file.type];
  if (!ext) return json({ error: '支持 jpg/png/webp/gif 图片或 mp4/webm/mov 视频' }, 400);
  if (file.size > MAX_SIZE) return json({ error: '单个文件不能超过 100MB' }, 400);

  const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return json({ url: `/api/file/${key}` }, 201);
};
