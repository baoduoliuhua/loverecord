// 回忆管理 UI：密码登录、添加/编辑表单弹层、照片上传
import { getPassword, setPassword, verifyPassword, saveMemory, uploadPhoto, esc, type OnlineMemory } from './memories-shared';

export interface AdminHooks {
  onChanged: () => void; // 数据变化后刷新列表
}

export function isLoggedIn(): boolean {
  return !!getPassword();
}

// 弹出密码框，成功后回调
export function askPassword(onSuccess: () => void) {
  const pwd = window.prompt('输入共享密码进行管理：');
  if (pwd === null) return;
  verifyPassword(pwd).then(ok => {
    if (ok) { setPassword(pwd); onSuccess(); }
    else alert('密码不对');
  }).catch(() => alert('验证失败，请检查网络'));
}

const SCENE_OPTIONS: [string, string][] = [
  ['default', '日常（无动画）'],
  ['seaside', '🌊 海岸（海浪+涟漪）'],
  ['mountain', '⛰️ 爬山（登山动画）'],
  ['city', '🌃 城市夜景'],
  ['spring', '🌸 春（樱花）'],
  ['summer', '☀️ 夏（光点）'],
  ['autumn', '🍂 秋（落叶）'],
  ['winter', '❄️ 冬（雪花）'],
  ['rain', '🌧️ 雨天（雨滴+涟漪）'],
  ['fireworks', '🎆 烟火（点击放烟花）'],
  ['starlight', '✨ 星空（流星）'],
];

export function openMemoryForm(existing: OnlineMemory | null, hooks: AdminHooks) {
  // 已存在弹层则先移除
  document.getElementById('memory-form-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'memory-form-modal';
  modal.className = 'admin-modal';
  modal.innerHTML = `
    <div class="admin-modal-card card">
      <h3 style="margin-bottom:18px">${existing ? '编辑回忆' : '添加回忆'}</h3>
      <form id="memory-form">
        <div class="admin-row">
          <div style="flex:1"><label>标题 *</label><input name="title" required maxlength="50" value="${esc(existing?.title || '')}" /></div>
          <div><label>日期 *</label><input name="sortDate" type="date" required value="${existing?.sortDate || new Date().toISOString().slice(0, 10)}" /></div>
        </div>
        <div style="margin-top:12px"><label>场景动画</label>
          <select name="scene">${SCENE_OPTIONS.map(([v, l]) => `<option value="${v}" ${existing?.scene === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </div>
        <div style="margin-top:12px"><label>正文</label><textarea name="content" rows="4" maxlength="5000" placeholder="这一天发生了什么…">${esc(existing?.content || '')}</textarea></div>
        <div style="margin-top:12px"><label>照片（可选，最多12张，每张≤8MB）</label>
          <input name="photo" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" />
          <div class="admin-photo-list"></div>
        </div>
        <div class="admin-form-actions">
          <button type="button" class="btn ghost" id="memory-form-cancel">取消</button>
          <button type="submit" class="btn" id="memory-form-submit">保存</button>
        </div>
        <p class="admin-form-error" hidden></p>
      </form>
    </div>`;
  document.body.appendChild(modal);

  // 多图管理：已上传的 URL 列表 + 待上传的本地文件列表
  let imageUrls: string[] = existing ? (existing.images?.length ? [...existing.images] : existing.image ? [existing.image] : []) : [];
  let pendingFiles: File[] = [];
  const listEl = modal.querySelector<HTMLElement>('.admin-photo-list')!;
  const fileInput = modal.querySelector<HTMLInputElement>('input[name=photo]')!;

  function renderPhotoList() {
    listEl.innerHTML = '';
    imageUrls.forEach((url, i) => {
      const item = document.createElement('div');
      item.className = 'admin-photo-item';
      item.innerHTML = `<img src="${url}" alt="照片${i + 1}" /><button type="button" title="移除">×</button>`;
      item.querySelector('button')!.addEventListener('click', () => {
        imageUrls.splice(i, 1); renderPhotoList();
      });
      listEl.appendChild(item);
    });
    pendingFiles.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'admin-photo-item pending';
      item.innerHTML = `<img src="${URL.createObjectURL(f)}" alt="待上传${i + 1}" /><button type="button" title="移除">×</button>`;
      item.querySelector('button')!.addEventListener('click', () => {
        pendingFiles.splice(i, 1); renderPhotoList();
      });
      listEl.appendChild(item);
    });
  }
  renderPhotoList();

  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files || []);
    const room = 12 - imageUrls.length - pendingFiles.length;
    if (files.length > room) alert(`最多 12 张，当前还能再加 ${Math.max(room, 0)} 张`);
    pendingFiles.push(...files.slice(0, Math.max(room, 0)));
    fileInput.value = '';
    renderPhotoList();
  });
  const close = () => modal.remove();
  modal.querySelector('#memory-form-cancel')!.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  modal.querySelector('#memory-form')!.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const btn = modal.querySelector<HTMLButtonElement>('#memory-form-submit')!;
    const errEl = modal.querySelector<HTMLElement>('.admin-form-error')!;
    btn.disabled = true; btn.textContent = '保存中…'; errEl.hidden = true;
    try {
      // 逐个上传新选照片
      for (const f of pendingFiles) {
        const url = await uploadPhoto(f);
        imageUrls.push(url);
      }
      const sortDate = (form.elements.namedItem('sortDate') as HTMLInputElement).value;
      await saveMemory({
        id: existing?.id,
        title: (form.elements.namedItem('title') as HTMLInputElement).value,
        sortDate,
        date: sortDate.replaceAll('-', '.'),
        scene: (form.elements.namedItem('scene') as HTMLSelectElement).value,
        content: (form.elements.namedItem('content') as HTMLTextAreaElement).value,
        image: imageUrls[0] || undefined,
        images: imageUrls.length ? imageUrls : undefined,
        alt: (form.elements.namedItem('title') as HTMLInputElement).value,
      }, !!existing);
      close();
      hooks.onChanged();
    } catch (err: any) {
      errEl.textContent = err.message || '保存失败';
      errEl.hidden = false;
      btn.disabled = false; btn.textContent = '保存';
    }
  });
}
