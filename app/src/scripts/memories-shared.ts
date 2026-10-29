// 在线回忆数据访问 + 共享密码会话（与日记共用同一密码）
export interface OnlineMemory {
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

// 归一化图片数组（兼容旧单图数据）
export function imagesOf(m: { image?: string; images?: string[] }): string[] {
  if (m.images && m.images.length) return m.images;
  return m.image ? [m.image] : [];
}

const PWD_KEY = 'loverecord-diary-pwd';

export function getPassword(): string {
  return sessionStorage.getItem(PWD_KEY) || '';
}
export function setPassword(pwd: string) {
  sessionStorage.setItem(PWD_KEY, pwd);
}

export function authHeaders(): Record<string, string> {
  return { 'X-Diary-Password': getPassword() };
}

export async function verifyPassword(pwd: string): Promise<boolean> {
  const res = await fetch('/api/diary', { method: 'HEAD', headers: { 'X-Diary-Password': pwd } });
  return res.status === 204;
}

export async function fetchOnlineMemories(): Promise<OnlineMemory[]> {
  try {
    const res = await fetch('/api/memories');
    if (!res.ok) return [];
    const data = await res.json();
    return data.memories || [];
  } catch { return []; }
}

export async function saveMemory(item: Partial<OnlineMemory>, isEdit: boolean): Promise<OnlineMemory> {
  const res = await fetch('/api/memories', {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(item),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '保存失败');
  return data.memory;
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`/api/memories?id=${encodeURIComponent(id)}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  if (!res.ok) throw new Error('删除失败');
}

export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '上传失败');
  return data.url;
}

export function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
