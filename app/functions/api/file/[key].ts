// 读取 R2 中的照片/视频（支持 Range，视频可拖动进度）
export const onRequestGet: PagesFunction = async ({ env, params, request }) => {
  const key = params.key as string;
  if (!/^[\w.-]+$/.test(key)) return new Response('bad key', { status: 400 });

  const range = request.headers.get('Range');
  if (range) {
    const m = /bytes=(\d+)-(\d*)/.exec(range);
    if (m) {
      const start = Number(m[1]);
      const head = await env.BUCKET.head(key);
      if (!head) return new Response('not found', { status: 404 });
      const total = head.size;
      const end = m[2] ? Math.min(Number(m[2]), total - 1) : total - 1;
      if (start >= total || start > end) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
      }
      const obj = await env.BUCKET.get(key, { range: { offset: start, length: end - start + 1 } });
      if (!obj) return new Response('not found', { status: 404 });
      const headers = new Headers();
      headers.set('Content-Type', head.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Content-Range', `bytes ${start}-${end}/${total}`);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Length', String(end - start + 1));
      return new Response(obj.body, { status: 206, headers });
    }
  }

  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response('not found', { status: 404 });
  const headers = new Headers();
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Accept-Ranges', 'bytes');
  return new Response(obj.body, { headers });
};
