// 回忆管理 UI：密码登录、添加/编辑表单弹层、照片上传
import { getPassword, setPassword, verifyPassword, saveMemory, uploadPhoto, esc, type OnlineMemory } from './memories-shared';
import cityCoords from '../content/city-coords.json';

// 加载 exifr（读取照片 EXIF 拍摄时间/GPS）
let exifrReady: Promise<any> | null = null;
function loadExifr(): Promise<any> {
  if (!exifrReady) {
    exifrReady = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js';
      s.onload = () => resolve((window as any).exifr);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return exifrReady;
}

// GPS → 最近城市（80km 内才归属）
function nearestCity(lat: number, lng: number): string | null {
  const R = 6371;
  let best: { name: string; d: number } | null = null;
  for (const [name, [clng, clat]] of Object.entries(cityCoords)) {
    const dLat = (clat - lat) * Math.PI / 180, dLng = (clng - lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(clat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (!best || d < best.d) best = { name, d };
  }
  return best && best.d <= 80 ? best.name : null;
}

// 从照片文件提取最早拍摄时间与城市
async function extractExif(files: File[]): Promise<{ date?: string; city?: string }> {
  try {
    const exifr = await loadExifr();
    let earliest: Date | null = null;
    let city: string | null = null;
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      try {
        const data = await exifr.parse(f, { gps: true });
        if (!data) continue;
        const dt = data.DateTimeOriginal || data.CreateDate;
        if (dt instanceof Date && (!earliest || dt < earliest)) earliest = dt;
        if (!city && data.latitude != null && data.longitude != null) {
          city = nearestCity(data.latitude, data.longitude);
        }
      } catch { /* 单张失败跳过 */ }
    }
    const out: { date?: string; city?: string } = {};
    if (earliest) {
      const d = earliest;
      out.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (city) out.city = city;
    return out;
  } catch { return {}; }
}

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
        <div style="margin-top:12px"><label>关联城市（可选，与足迹地图城市同名，如：南京）</label>
          <input name="city" maxlength="20" placeholder="填了之后，点地图上的城市能看到这条回忆" value="${esc(existing?.city || '')}" />
        </div>
        <div style="margin-top:12px"><label>正文</label><textarea name="content" rows="4" maxlength="5000" placeholder="这一天发生了什么…">${esc(existing?.content || '')}</textarea></div>
        <div style="margin-top:12px"><label>照片/视频（最多12个，每个≤100MB，视频支持mp4/webm/mov）</label>
          <input name="photo" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" />
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
      const isVid = /\.(mp4|webm|mov)(\?|$)/i.test(url);
      item.innerHTML = `${isVid ? '<div class="admin-video-placeholder">🎬</div>' : `<img src="${url}" alt="照片${i + 1}" />`}<button type="button" title="移除">×</button>`;
      item.querySelector('button')!.addEventListener('click', () => {
        imageUrls.splice(i, 1); renderPhotoList();
      });
      listEl.appendChild(item);
    });
    pendingFiles.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'admin-photo-item pending';
      const isVid = f.type.startsWith('video/');
      item.innerHTML = `${isVid ? '<div class="admin-video-placeholder">🎬</div>' : `<img src="${URL.createObjectURL(f)}" alt="待上传${i + 1}" />`}<button type="button" title="移除">×</button>`;
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

    // 自动读取 EXIF：最早拍摄时间 + GPS 最近城市
    const form = document.getElementById('memory-form') as HTMLFormElement;
    const dateInput = form.elements.namedItem('sortDate') as HTMLInputElement;
    const cityInput = form.elements.namedItem('city') as HTMLInputElement;
    const dateTouched = dateInput.dataset.touched === '1';
    extractExif(files).then(info => {
      const hints: string[] = [];
      if (info.date && !dateTouched && !existing) {
        dateInput.value = info.date;
        hints.push(`拍摄日期 ${info.date}`);
      }
      if (info.city && !cityInput.value.trim()) {
        cityInput.value = info.city;
        hints.push(`定位 ${info.city}`);
      }
      if (hints.length) {
        let tip = modal.querySelector<HTMLElement>('.exif-tip');
        if (!tip) {
          tip = document.createElement('p');
          tip.className = 'exif-tip';
          listEl.after(tip);
        }
        tip.textContent = '📷 已自动识别：' + hints.join('、') + '（可手动修改）';
      }
    });
  });

  // 用户手动改日期后不再被 EXIF 覆盖
  const dateInput = modal.querySelector<HTMLInputElement>('input[name=sortDate]')!;
  dateInput.addEventListener('change', () => { dateInput.dataset.touched = '1'; });
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
        city: (form.elements.namedItem('city') as HTMLInputElement).value.trim() || undefined,
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
