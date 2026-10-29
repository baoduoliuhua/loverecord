// 读取 R2 中的照片
export const onRequestGet: PagesFunction = async ({ env, params }) => {
  const key = params.key as string;
  if (!/^[\w.-]+$/.test(key)) return new Response('bad key', { status: 400 });
  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response('not found', { status: 404 });
  const headers = new Headers();
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
};
