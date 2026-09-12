export const DEG = Math.PI / 180

// 赤道坐标(J2000, 时角/度) -> 银道坐标(l/b, 度)
export function eqToGalactic(raHours, decDeg) {
  const ra = raHours * 15 * DEG
  const dec = decDeg * DEG
  const raNgp = 192.85948 * DEG
  const decNgp = 27.12825 * DEG
  const lNcp = 122.93192 * DEG
  const sinB =
    Math.sin(decNgp) * Math.sin(dec) +
    Math.cos(decNgp) * Math.cos(dec) * Math.cos(ra - raNgp)
  const b = Math.asin(Math.max(-1, Math.min(1, sinB)))
  const y = Math.cos(dec) * Math.sin(ra - raNgp)
  const x =
    Math.cos(decNgp) * Math.sin(dec) -
    Math.sin(decNgp) * Math.cos(dec) * Math.cos(ra - raNgp)
  let l = lNcp - Math.atan2(y, x)
  l = ((l / DEG) % 360 + 360) % 360
  return { l, b: b / DEG }
}

// 返回以太阳为原点的银河系直角坐标(光年)。x 指向银心, y 指向银河北极, z 补右手系
export function galacticPosition(raHours, decDeg, distLy) {
  const { l, b } = eqToGalactic(raHours, decDeg)
  const lr = l * DEG
  const br = b * DEG
  return {
    x: distLy * Math.cos(br) * Math.cos(lr),
    y: distLy * Math.sin(br),
    z: distLy * Math.cos(br) * Math.sin(lr),
  }
}

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// 地点 -> 赤经(时)/赤纬(度)，真实数据；无数据者用确定性伪坐标
export const locationCoords = {
  sirius: [6.7525, -16.716],
  'sirius-b': [6.7525, -16.716],
  canopus: [6.3992, -52.6957],
  arcturus: [14.2610, 19.1824],
  'alpha-cen': [14.6600, -60.8354],
  proxima: [14.4959, -62.6795],
  'proxima-b': [14.4959, -62.6795],
  'proxima-c': [14.4959, -62.6795],
  vega: [18.6156, 38.7837],
  capella: [5.2782, 45.9980],
  rigel: [5.2423, -8.2016],
  procyon: [7.6551, 5.2250],
  betelgeuse: [5.9195, 7.4070],
  achernar: [1.6286, -57.2367],
  altair: [19.8464, 8.8683],
  aldebaran: [4.5987, 16.5093],
  antares: [16.4901, -26.4320],
  spica: [13.4199, -11.1613],
  pollux: [7.7553, 28.0262],
  fomalhaut: [22.9608, -29.6222],
  deneb: [20.6905, 45.2803],
  regulus: [10.1395, 11.9672],
  castor: [7.5766, 31.8883],
  polaris: [2.5303, 89.2641],
  mizar: [13.3987, 54.9254],
  bellatrix: [5.4189, 6.3497],
  alnilam: [5.6036, -1.2019],
  alnitak: [5.6793, -1.9426],
  mintaka: [5.5334, -0.2991],
  saiph: [5.7959, -9.6696],
  wezen: [7.1399, -26.3932],
  adhara: [6.9770, -28.9721],
  algol: [3.1361, 40.9578],
  mirfak: [3.4054, 49.8612],
  elnath: [5.4382, 28.6075],
  alhena: [6.6285, 16.3993],
  denebola: [11.8177, 14.5720],
  alphard: [9.4598, -8.6586],
  rasalhague: [17.5822, 12.5600],
  enif: [21.7364, 9.8750],
  scheat: [23.0629, 28.0828],
  alpheratz: [0.1398, 29.0904],
  mirach: [1.1622, 35.6206],
  almach: [2.0650, 42.3297],
  caph: [0.1530, 59.1498],
  schedar: [0.6751, 56.5373],
  dubhe: [11.0621, 61.7510],
  merak: [11.0307, 56.3824],
  phecda: [11.8972, 53.6948],
  megrez: [12.2571, 57.0326],
  alioth: [12.9004, 55.9598],
  alkaid: [13.7923, 49.3133],
  // 近邻恒星
  barnard: [17.9633, 4.6933],
  wolf359: [10.9456, 7.0144],
  lalande: [11.0555, 35.9699],
  ross154: [18.8313, -23.8362],
  ross248: [23.6900, 44.1770],
  'epsilon-eri': [3.5484, -9.4583],
  lacaille: [23.0959, -35.8530],
  cygni61: [21.1169, 38.7500],
  'indus-eps': [22.0553, -56.7861],
  'tau-ceti': [1.7344, -15.9375],
  teegarden: [2.8922, 16.8782],
  kapteyn: [5.1963, -44.9990],
  gliese581: [15.3254, -7.7222],
  gliese667c: [17.0650, -34.9980],
  gliese436: [11.7083, 26.7030],
  gliese1214: [17.2536, 4.9740],
  groombridge: [11.8849, 37.7180],
  // 星云/星团/星系
  'orion-nebula': [5.5881, -5.3911],
  horsehead: [5.6810, -2.4580],
  'crab-nebula': [5.5755, 22.0145],
  'ring-nebula': [18.8933, 33.0292],
  'cat-eye': [17.9757, 66.6329],
  dumbbell: [19.9937, 22.7215],
  butterfly: [17.0943, -10.1615],
  lagoon: [18.0636, -24.3830],
  trifid: [18.0433, -23.0333],
  rosette: [6.5250, 4.9500],
  'eagle-nebula': [18.3130, -13.7920],
  carina: [10.7519, -59.8672],
  pleiades: [3.7917, 24.1167],
  hyades: [4.5000, 15.8667],
  beehive: [8.6733, 19.6667],
  m13: [16.6949, 36.4603],
  'omega-cen': [13.4463, -47.4795],
  'sagittarius-a': [17.7611, -29.0078],
  'galactic-center': [17.7611, -29.0078],
  'galactic-bar': [17.7611, -29.0078],
  'cygnus-x1': [19.9715, 35.2017],
  'orion-arm': [5.0, 0.0],
  'local-bubble': [0.0, 0.0],
  'local-cloud': [0.0, 0.0],
  'galactic-edge': [0.0, 0.0],
  lmc: [5.3919, -69.7561],
  smc: [0.8786, -72.8286],
  andromeda: [0.7123, 41.2692],
  triangulum: [1.5641, 30.6602],
  'centaurus-a': [13.4259, -43.0192],
  whirlpool: [13.4979, 47.1953],
  sombrero: [12.6667, -11.6231],
  'virgo-cluster': [12.5000, 12.5000],
  laniakea: [10.0, -46.0],
  m87: [12.5137, 12.3911],
  // 系外行星（近似宿主星方向）
  trappist: [23.1083, -5.0414],
  kepler186f: [19.9000, 43.9500],
  kepler22b: [19.2722, 47.8831],
  kepler442b: [19.0000, 39.5000],
  kepler452b: [19.7019, 44.2780],
  hd189733b: [20.0036, 22.7108],
}

// 真实亮星/近星表（RA 时, Dec 度, 距离 光年, 星等, 颜色）
export const starCatalog = [
  { name: '天狼星', ra: 6.7525, dec: -16.716, dist: 8.6, mag: -1.46, color: '#cfe3ff' },
  { name: '老人星', ra: 6.3992, dec: -52.696, dist: 310, mag: -0.74, color: '#fff4e0' },
  { name: '南门二', ra: 14.66, dec: -60.835, dist: 4.37, mag: -0.27, color: '#ffe9c4' },
  { name: '大角星', ra: 14.261, dec: 19.182, dist: 36.7, mag: -0.05, color: '#ffd8a8' },
  { name: '织女星', ra: 18.6156, dec: 38.784, dist: 25.0, mag: 0.03, color: '#dbe8ff' },
  { name: '五车二', ra: 5.2782, dec: 45.998, dist: 42.9, mag: 0.08, color: '#fff0cf' },
  { name: '参宿七', ra: 5.2423, dec: -8.202, dist: 863, mag: 0.13, color: '#cfe0ff' },
  { name: '南河三', ra: 7.6551, dec: 5.225, dist: 11.46, mag: 0.34, color: '#f2f6ff' },
  { name: '参宿四', ra: 5.9195, dec: 7.407, dist: 548, mag: 0.42, color: '#ffb27a' },
  { name: '水委一', ra: 1.6286, dec: -57.237, dist: 139, mag: 0.46, color: '#bcd6ff' },
  { name: '河鼓二', ra: 19.8464, dec: 8.868, dist: 16.7, mag: 0.77, color: '#f4f7ff' },
  { name: '毕宿五', ra: 4.5987, dec: 16.509, dist: 65.3, mag: 0.85, color: '#ffbe86' },
  { name: '心宿二', ra: 16.4901, dec: -26.432, dist: 554, mag: 1.06, color: '#ff9d6b' },
  { name: '角宿一', ra: 13.4199, dec: -11.161, dist: 250, mag: 0.98, color: '#cfe0ff' },
  { name: '北河三', ra: 7.7553, dec: 28.026, dist: 33.8, mag: 1.14, color: '#ffcf9e' },
  { name: '北落师门', ra: 22.9608, dec: -29.622, dist: 25.1, mag: 1.16, color: '#eef3ff' },
  { name: '天津四', ra: 20.6905, dec: 45.28, dist: 2615, mag: 1.25, color: '#e8f0ff' },
  { name: '轩辕十四', ra: 10.1395, dec: 11.967, dist: 79.3, mag: 1.35, color: '#d8e6ff' },
  { name: '北河二', ra: 7.5766, dec: 31.888, dist: 51, mag: 1.58, color: '#eef3ff' },
  { name: '勾陈一', ra: 2.5303, dec: 89.264, dist: 433, mag: 1.98, color: '#fff0cf' },
  { name: '开阳', ra: 13.3987, dec: 54.925, dist: 82.9, mag: 2.23, color: '#eaf1ff' },
  { name: '参宿五', ra: 5.4189, dec: 6.35, dist: 250, mag: 1.64, color: '#cfe0ff' },
  { name: '参宿一', ra: 5.6793, dec: -1.943, dist: 1260, mag: 1.77, color: '#c8dcff' },
  { name: '参宿二', ra: 5.6036, dec: -1.202, dist: 1342, mag: 1.69, color: '#c8dcff' },
  { name: '参宿三', ra: 5.5334, dec: -0.299, dist: 1200, mag: 2.25, color: '#c8dcff' },
  { name: '参宿六', ra: 5.7959, dec: -9.67, dist: 650, mag: 2.07, color: '#cfe0ff' },
  { name: '弧矢七', ra: 6.977, dec: -28.972, dist: 430, mag: 1.5, color: '#cfe0ff' },
  { name: '大陵五', ra: 3.1361, dec: 40.958, dist: 90, mag: 2.12, color: '#e6eeff' },
  { name: '天船三', ra: 3.4054, dec: 49.861, dist: 510, mag: 1.79, color: '#fff0cf' },
  { name: '五车五', ra: 5.4382, dec: 28.608, dist: 134, mag: 1.65, color: '#cfe0ff' },
  { name: '井宿三', ra: 6.6285, dec: 16.399, dist: 109, mag: 1.93, color: '#eef3ff' },
  { name: '五帝座一', ra: 11.8177, dec: 14.572, dist: 35.9, mag: 2.14, color: '#f2f6ff' },
  { name: '星宿一', ra: 9.4598, dec: -8.659, dist: 177, mag: 1.98, color: '#ffcf9e' },
  { name: '侯', ra: 17.5822, dec: 12.56, dist: 48.6, mag: 2.08, color: '#f4f7ff' },
  { name: '危宿三', ra: 21.7364, dec: 9.875, dist: 690, mag: 2.38, color: '#ffd8a8' },
  { name: '壁宿二', ra: 0.1398, dec: 29.09, dist: 97, mag: 2.06, color: '#dbe8ff' },
  { name: '奎宿九', ra: 1.1622, dec: 35.621, dist: 197, mag: 2.05, color: '#ffbe86' },
  { name: '天大将军一', ra: 2.065, dec: 42.33, dist: 350, mag: 2.1, color: '#ffd8a8' },
  { name: '王良一', ra: 0.153, dec: 59.15, dist: 54, mag: 2.27, color: '#fff0cf' },
  { name: '王良四', ra: 0.6751, dec: 56.537, dist: 228, mag: 2.24, color: '#ffcf9e' },
  { name: '天枢', ra: 11.0621, dec: 61.751, dist: 123, mag: 1.79, color: '#ffd8a8' },
  { name: '天璇', ra: 11.0307, dec: 56.382, dist: 79.7, mag: 2.37, color: '#eef3ff' },
  { name: '天玑', ra: 11.8972, dec: 53.695, dist: 83.2, mag: 2.44, color: '#eef3ff' },
  { name: '天权', ra: 12.2571, dec: 57.033, dist: 80.5, mag: 3.31, color: '#eef3ff' },
  { name: '玉衡', ra: 12.9004, dec: 55.96, dist: 82.6, mag: 1.77, color: '#eef3ff' },
  { name: '摇光', ra: 13.7923, dec: 49.313, dist: 103.9, mag: 1.86, color: '#cfe0ff' },
  { name: '比邻星', ra: 14.4959, dec: -62.68, dist: 4.24, mag: 11.13, color: '#ff9d6b' },
  { name: '巴纳德星', ra: 17.9633, dec: 4.693, dist: 5.96, mag: 9.51, color: '#ff9d6b' },
  { name: '沃尔夫 359', ra: 10.9456, dec: 7.014, dist: 7.86, mag: 13.5, color: '#ff9d6b' },
  { name: '拉兰德 21185', ra: 11.0555, dec: 35.97, dist: 8.31, mag: 7.52, color: '#ff9d6b' },
  { name: '罗斯 154', ra: 18.8313, dec: -23.836, dist: 9.7, mag: 10.44, color: '#ff9d6b' },
  { name: '天苑四', ra: 3.5484, dec: -9.458, dist: 10.5, mag: 3.73, color: '#ffcf9e' },
  { name: '天仓五', ra: 1.7344, dec: -15.938, dist: 11.9, mag: 3.5, color: '#ffe9c4' },
  { name: '印第安座ε', ra: 22.0553, dec: -56.786, dist: 11.8, mag: 4.69, color: '#ffcf9e' },
  { name: '格利泽 581', ra: 15.3254, dec: -7.722, dist: 20.4, mag: 10.56, color: '#ff9d6b' },
  { name: '格利泽 667C', ra: 17.065, dec: -34.998, dist: 23.6, mag: 10.2, color: '#ff9d6b' },
]

export const AU = 1.58125e-5

// 太阳系天体在场景中的位置（AU，转光年），角度固定以保证与太阳系图层一致
export const SOLAR = {
  sun: { a: 0, ang: 0 },
  mercury: { a: 0.387, ang: 0.6 },
  venus: { a: 0.723, ang: 1.5 },
  earth: { a: 1.0, ang: 2.4 },
  'earth-station': { a: 1.0, ang: 2.4, off: 0.00008, offAng: 0.2 },
  academy: { a: 1.0, ang: 2.4, off: 0.00004, offAng: 4.0 },
  moon: { a: 1.0, ang: 2.4, off: 0.00257, offAng: 1.0 },
  'lunar-base': { a: 1.0, ang: 2.4, off: 0.00257, offAng: 1.4 },
  mars: { a: 1.524, ang: 3.3 },
  phobos: { a: 1.524, ang: 3.3, off: 0.00006, offAng: 0.5 },
  deimos: { a: 1.524, ang: 3.3, off: 0.00016, offAng: 2.5 },
  'mars-colony': { a: 1.524, ang: 3.3, off: 0.0001, offAng: 5.0 },
  vesta: { a: 1.8, ang: 5.5 },
  ceres: { a: 2.2, ang: 0.3 },
  'asteroid-belt': { a: 2.7, ang: 1.0 },
  jupiter: { a: 5.203, ang: 4.2 },
  io: { a: 5.203, ang: 4.2, off: 0.0006, offAng: 0.4 },
  europa: { a: 5.203, ang: 4.2, off: 0.0009, offAng: 1.6 },
  'europa-station': { a: 5.203, ang: 4.2, off: 0.0009, offAng: 2.0 },
  ganymede: { a: 5.203, ang: 4.2, off: 0.0013, offAng: 2.8 },
  callisto: { a: 5.203, ang: 4.2, off: 0.0021, offAng: 4.0 },
  saturn: { a: 9.537, ang: 5.1 },
  enceladus: { a: 9.537, ang: 5.1, off: 0.0016, offAng: 0.8 },
  titan: { a: 9.537, ang: 5.1, off: 0.0025, offAng: 2.2 },
  uranus: { a: 19.19, ang: 6.0 },
  miranda: { a: 19.19, ang: 6.0, off: 0.0009, offAng: 1.1 },
  neptune: { a: 30.07, ang: 0.9 },
  triton: { a: 30.07, ang: 0.9, off: 0.0012, offAng: 2.6 },
  pluto: { a: 39.5, ang: 1.8 },
  charon: { a: 39.5, ang: 1.8, off: 0.0002, offAng: 0.7 },
  kuiper: { a: 45, ang: 3.0 },
  sedna: { a: 506, ang: 4.0 },
  oort: { a: 50000, ang: 5.0 },
}

function solarPosition(id) {
  const s = SOLAR[id]
  if (!s) return null
  let x = s.a * Math.cos(s.ang)
  let z = s.a * Math.sin(s.ang)
  if (s.off) {
    x += s.off * Math.cos(s.offAng)
    z += s.off * Math.sin(s.offAng)
  }
  return { x: x * AU, y: 0, z: z * AU }
}

export function getLocationCoords(location) {
  const c = locationCoords[location.id]
  if (c) return c
  const h = hash(location.id)
  const l = h % 360
  const b = ((h >>> 9) % 140) - 70
  // 由 l/b 反推一个赤经赤纬太麻烦，直接返回伪银道坐标
  return { pseudo: { l, b } }
}

// 以太阳为原点的位置(光年)
export function getLocationPosition(location) {
  const sp = solarPosition(location.id)
  if (sp) return sp
  const c = locationCoords[location.id]
  if (c) return galacticPosition(c[0], c[1], location.distance)
  const h = hash(location.id)
  const l = (h % 360) * DEG
  const b = (((h >>> 9) % 140) - 70) * DEG
  const d = location.distance
  return {
    x: d * Math.cos(b) * Math.cos(l),
    y: d * Math.sin(b),
    z: d * Math.cos(b) * Math.sin(l),
  }
}
