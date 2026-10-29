// 一次性脚本：GeoJSON → 简笔 SVG 轮廓（抽稀 + 投影）
// 底层国界：100000.json（含藏南完整国界）
// 上层省界：100000_full.json
const fs = require('fs');
const country = require('./china-outline-only.tmp.json');
const provinces = require('./china-full.tmp.json');

const COS = Math.cos(35 * Math.PI / 180); // 中心纬度修正

// Douglas-Peucker 抽稀
function dp(points, tol) {
  if (points.length < 3) return points;
  const [x1, y1] = points[0], [x2, y2] = points[points.length - 1];
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1e-9;
  let maxD = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const d = Math.abs(dy * px - dx * py + x2 * y1 - y2 * x1) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [points[0], points[points.length - 1]];
  return [...dp(points.slice(0, idx + 1), tol).slice(0, -1), ...dp(points.slice(idx), tol)];
}

function ringsOf(geo) {
  const rings = [];
  for (const f of geo.features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const poly of polys) {
      for (const ring of poly) {
        if (ring.length > 3) rings.push(ring);
      }
    }
  }
  return rings;
}

const rings = [...ringsOf(country), ...ringsOf(provinces)];

// 全局范围
let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
for (const ring of rings) for (const [lng, lat] of ring) {
  minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
  minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
}
const W = 1000;
const scale = W / ((maxLng - minLng) * COS);
const H = Math.round((maxLat - minLat) * scale);
const project = ([lng, lat]) => [
  +(((lng - minLng) * COS * scale).toFixed(1)),
  +(((maxLat - lat) * scale).toFixed(1)),
];

function toPaths(ringList, tol) {
  return ringList.map(ring => {
    // 闭合环首末点相同会让 DP 距离计算全部归零，先去掉末点
    const pts0 = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1) : ring;
    const pts = dp(pts0, tol);
    return 'M' + pts.map(p => project(p).join(',')).join('L') + 'Z';
  });
}

const out = {
  viewBox: `0 0 ${W} ${H}`,
  countryPaths: toPaths(ringsOf(country), 0.05),
  provincePaths: toPaths(ringsOf(provinces), 0.06),
  project: { minLng, maxLat, cos: COS, scale },
};
fs.writeFileSync('src/content/china-outline.json', JSON.stringify(out));
console.log('国界环:', out.countryPaths.length, '省界环:', out.provincePaths.length,
  'viewBox:', out.viewBox, 'bytes:', JSON.stringify(out).length);
fs.unlinkSync('china-full.tmp.json');
fs.unlinkSync('china-outline-only.tmp.json');
