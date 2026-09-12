export const typeMeta = {
  star: { label: '恒星', icon: '⭐', color: '#f59e0b' },
  planet: { label: '行星', icon: '🪐', color: '#22c55e' },
  moon: { label: '卫星', icon: '🌙', color: '#94a3b8' },
  dwarf: { label: '矮行星', icon: '🌑', color: '#a3a3a3' },
  nebula: { label: '星云', icon: '☁️', color: '#a78bfa' },
  cluster: { label: '星团', icon: '✨', color: '#38bdf8' },
  galaxy: { label: '星系', icon: '🌌', color: '#818cf8' },
  station: { label: '空间站', icon: '🛰️', color: '#2dd4bf' },
  blackhole: { label: '黑洞', icon: '🕳️', color: '#f472b6' },
  special: { label: '特殊', icon: '🧭', color: '#fb7185' },
}

export const categories = [
  { id: 'all', label: '全部' },
  { id: 'star', label: '恒星' },
  { id: 'planet', label: '行星' },
  { id: 'moon', label: '卫星' },
  { id: 'dwarf', label: '矮行星' },
  { id: 'nebula', label: '星云' },
  { id: 'cluster', label: '星团' },
  { id: 'galaxy', label: '星系' },
  { id: 'blackhole', label: '黑洞' },
  { id: 'station', label: '空间站' },
]

const AU = 1.58125e-5 // 1 天文单位 ≈ 1.58125e-5 光年

export const locations = [
  // ---------- 太阳系 ----------
  { id: 'earth', name: '地球', type: 'planet', distance: 0, desc: '太阳系第三行星 · 人类母星', alias: ['Earth', '太阳系', '老家'] },
  { id: 'moon', name: '月球', type: 'moon', distance: 0.00257 * AU, desc: '地球唯一天然卫星', alias: ['Moon', '月亮'] },
  { id: 'sun', name: '太阳', type: 'star', distance: 1 * AU, desc: '太阳系中心恒星', alias: ['Sun', '日'] },
  { id: 'mercury', name: '水星', type: 'planet', distance: 0.9 * AU, desc: '离太阳最近的行星', alias: ['Mercury', '辰星'] },
  { id: 'venus', name: '金星', type: 'planet', distance: 0.72 * AU, desc: '高温高压的类地行星', alias: ['Venus', '启明星'] },
  { id: 'mars', name: '火星', type: 'planet', distance: 1.5 * AU, desc: '红色行星 · 人类第二家园', alias: ['Mars', '荧惑'] },
  { id: 'phobos', name: '火卫一', type: 'moon', distance: 1.5 * AU, desc: '火星内侧卫星', alias: ['Phobos'] },
  { id: 'deimos', name: '火卫二', type: 'moon', distance: 1.5 * AU, desc: '火星外侧小卫星', alias: ['Deimos'] },
  { id: 'vesta', name: '灶神星', type: 'dwarf', distance: 1.8 * AU, desc: '小行星带第二大天体', alias: ['Vesta'] },
  { id: 'ceres', name: '谷神星', type: 'dwarf', distance: 2.2 * AU, desc: '小行星带最大矮行星', alias: ['Ceres'] },
  { id: 'asteroid-belt', name: '小行星带', type: 'special', distance: 2.7 * AU, desc: '火星与木星之间的碎片带', alias: ['Asteroid Belt'] },
  { id: 'jupiter', name: '木星', type: 'planet', distance: 5.2 * AU, desc: '太阳系最大气态行星', alias: ['Jupiter', '岁星'] },
  { id: 'io', name: '木卫一', type: 'moon', distance: 5.2 * AU, desc: '火山活动最剧烈的天体', alias: ['Io'] },
  { id: 'europa', name: '木卫二', type: 'moon', distance: 5.2 * AU, desc: '冰壳下或藏有海洋', alias: ['Europa', '欧罗巴'] },
  { id: 'ganymede', name: '木卫三', type: 'moon', distance: 5.2 * AU, desc: '太阳系最大卫星', alias: ['Ganymede', '盖尼米得'] },
  { id: 'callisto', name: '木卫四', type: 'moon', distance: 5.2 * AU, desc: '陨石坑密布的古老卫星', alias: ['Callisto'] },
  { id: 'saturn', name: '土星', type: 'planet', distance: 9.6 * AU, desc: '拥有壮丽环系的巨行星', alias: ['Saturn', '镇星'] },
  { id: 'enceladus', name: '土卫二', type: 'moon', distance: 9.6 * AU, desc: '喷发水汽羽流的冰卫星', alias: ['Enceladus', '恩克拉多斯'] },
  { id: 'titan', name: '土卫六', type: 'moon', distance: 9.6 * AU, desc: '拥有浓厚大气与甲烷湖', alias: ['Titan', '泰坦'] },
  { id: 'uranus', name: '天王星', type: 'planet', distance: 19.2 * AU, desc: '躺着自转的冰巨星', alias: ['Uranus'] },
  { id: 'miranda', name: '天卫五', type: 'moon', distance: 19.2 * AU, desc: '地貌奇特的卫星', alias: ['Miranda'] },
  { id: 'neptune', name: '海王星', type: 'planet', distance: 30.1 * AU, desc: '风暴最强的冰巨星', alias: ['Neptune'] },
  { id: 'triton', name: '海卫一', type: 'moon', distance: 30.1 * AU, desc: '逆行公转的冰卫星', alias: ['Triton'] },
  { id: 'pluto', name: '冥王星', type: 'dwarf', distance: 39.5 * AU, desc: '柯伊伯带矮行星', alias: ['Pluto'] },
  { id: 'charon', name: '冥卫一', type: 'moon', distance: 39.5 * AU, desc: '冥王星的伴星', alias: ['Charon', '卡戎'] },
  { id: 'kuiper', name: '柯伊伯带', type: 'special', distance: 45 * AU, desc: '海王星外的冰质天体带', alias: ['Kuiper Belt'] },
  { id: 'sedna', name: '塞德娜', type: 'dwarf', distance: 506 * AU, desc: '极遥远的内奥尔特天体', alias: ['Sedna'] },
  { id: 'oort', name: '奥尔特云', type: 'special', distance: 50000 * AU, desc: '太阳系最外缘彗星云', alias: ['Oort Cloud'] },

  // ---------- 近邻恒星 ----------
  { id: 'proxima', name: '比邻星', type: 'star', distance: 4.24, desc: '离太阳最近的恒星 · 红矮星', alias: ['Proxima', '半人马座比邻星'] },
  { id: 'alpha-cen', name: '半人马座α', type: 'star', distance: 4.37, desc: '三合星系统 · 南门二', alias: ['Alpha Centauri', '南门二'] },
  { id: 'proxima-b', name: '比邻星 b', type: 'planet', distance: 4.24, desc: '位于宜居带内的类地行星', alias: ['Proxima b'] },
  { id: 'proxima-c', name: '比邻星 c', type: 'planet', distance: 4.24, desc: '超级地球候选行星', alias: ['Proxima c'] },
  { id: 'barnard', name: '巴纳德星', type: 'star', distance: 5.96, desc: '蛇夫座红矮星 · 高速自行', alias: ['Barnard'] },
  { id: 'wolf359', name: '沃尔夫 359', type: 'star', distance: 7.86, desc: '暗淡的红矮星 · 耀星', alias: ['Wolf 359'] },
  { id: 'lalande', name: '拉兰德 21185', type: 'star', distance: 8.31, desc: '大熊座红矮星', alias: ['Lalande 21185'] },
  { id: 'sirius', name: '天狼星', type: 'star', distance: 8.6, desc: '夜空最亮恒星 · 双星系统', alias: ['Sirius', '大犬座α'] },
  { id: 'sirius-b', name: '天狼星 B', type: 'star', distance: 8.6, desc: '白矮星伴星', alias: ['Sirius B'] },
  { id: 'ross154', name: '罗斯 154', type: 'star', distance: 9.7, desc: '蛇夫座红矮星', alias: ['Ross 154'] },
  { id: 'ross248', name: '罗斯 248', type: 'star', distance: 10.3, desc: '仙女座红矮星', alias: ['Ross 248'] },
  { id: 'epsilon-eri', name: '天苑四', type: 'star', distance: 10.5, desc: '波江座ε · 年轻橙矮星', alias: ['Epsilon Eridani', '波江座ε'] },
  { id: 'lacaille', name: '拉卡伊 9352', type: 'star', distance: 10.7, desc: '南鱼座红矮星', alias: ['Lacaille 9352'] },
  { id: 'cygni61', name: '天鹅座 61', type: 'star', distance: 11.4, desc: '疑似生命友好星系', alias: ['61 Cygni'] },
  { id: 'procyon', name: '南河三', type: 'star', distance: 11.46, desc: '小犬座α · 亮星', alias: ['Procyon', '小犬座α'] },
  { id: 'indus-eps', name: '印第安座ε', type: 'star', distance: 11.8, desc: '橙矮星 · 伴褐矮星', alias: ['Epsilon Indi'] },
  { id: 'tau-ceti', name: '天仓五', type: 'star', distance: 11.9, desc: '鲸鱼座τ · 类太阳恒星', alias: ['Tau Ceti', '鲸鱼座τ'] },
  { id: 'teegarden', name: '蒂加登星', type: 'star', distance: 12.5, desc: '红矮星 · 两颗类地行星', alias: ['Teegarden'] },
  { id: 'kapteyn', name: '卡普坦星', type: 'star', distance: 12.8, desc: '高速运行的古老恒星', alias: ['Kapteyn'] },
  { id: 'altair', name: '牛郎星', type: 'star', distance: 16.7, desc: '河鼓二 · 夏季大三角', alias: ['Altair', '河鼓二'] },
  { id: 'gliese581', name: '格利泽 581', type: 'star', distance: 20.4, desc: '红矮星 · 含宜居带行星', alias: ['Gliese 581'] },
  { id: 'gliese667c', name: '格利泽 667C', type: 'star', distance: 23.6, desc: '三合星 · 多颗超级地球', alias: ['Gliese 667C'] },
  { id: 'vega', name: '织女星', type: 'star', distance: 25.0, desc: '天琴座α · 蓝白色亮星', alias: ['Vega', '天琴座α'] },
  { id: 'fomalhaut', name: '北落师门', type: 'star', distance: 25.1, desc: '南鱼座α · 尘埃盘', alias: ['Fomalhaut', '南鱼座α'] },
  { id: 'groombridge', name: '格鲁姆布里奇 1830', type: 'star', distance: 29.9, desc: '双红矮星系统', alias: ['Groombridge 1830'] },
  { id: 'gliese436', name: '格利泽 436', type: 'star', distance: 33, desc: '红矮星 · 热海王星', alias: ['Gliese 436'] },
  { id: 'arcturus', name: '大角星', type: 'star', distance: 36.7, desc: '牧夫座α · 红巨星', alias: ['Arcturus', '牧夫座α'] },
  { id: 'trappist', name: 'TRAPPIST-1', type: 'planet', distance: 40.7, desc: '七颗类地行星系统', alias: ['特拉比斯特-1'] },
  { id: 'capella', name: '五车二', type: 'star', distance: 42.9, desc: '御夫座α · 四合星', alias: ['Capella', '御夫座α'] },
  { id: 'gliese1214', name: '格利泽 1214', type: 'star', distance: 48, desc: '红矮星 · 水世界行星', alias: ['Gliese 1214'] },
  { id: 'hd189733b', name: 'HD 189733 b', type: 'planet', distance: 64.5, desc: '玻璃雨的热木星', alias: ['HD189733b'] },
  { id: 'aldebaran', name: '毕宿五', type: 'star', distance: 65.3, desc: '金牛座α · 红巨星', alias: ['Aldebaran', '金牛座α'] },
  { id: 'betelgeuse', name: '参宿四', type: 'star', distance: 548, desc: '猎户座α · 红超巨星', alias: ['Betelgeuse', '猎户座α'] },
  { id: 'antares', name: '心宿二', type: 'star', distance: 554, desc: '天蝎座α · 红超巨星', alias: ['Antares', '天蝎座α'] },
  { id: 'rigel', name: '参宿七', type: 'star', distance: 863, desc: '猎户座β · 蓝超巨星', alias: ['Rigel', '猎户座β'] },
  { id: 'deneb', name: '天津四', type: 'star', distance: 2615, desc: '天鹅座α · 夏季大三角', alias: ['Deneb', '天鹅座α'] },

  // ---------- 行星系 / 系外行星 ----------
  { id: 'kepler186f', name: '开普勒 186f', type: 'planet', distance: 582, desc: '首颗类地宜居带行星', alias: ['Kepler-186f'] },
  { id: 'kepler22b', name: '开普勒 22b', type: 'planet', distance: 640, desc: '宜居带超级地球', alias: ['Kepler-22b'] },
  { id: 'kepler442b', name: '开普勒 442b', type: 'planet', distance: 1200, desc: '高宜居指数类地行星', alias: ['Kepler-442b'] },
  { id: 'kepler452b', name: '开普勒 452b', type: 'planet', distance: 1400, desc: '地球的“大表哥”', alias: ['Kepler-452b'] },

  // ---------- 星团 ----------
  { id: 'hyades', name: '毕星团', type: 'cluster', distance: 151, desc: '金牛座疏散星团', alias: ['Hyades'] },
  { id: 'pleiades', name: '昴星团', type: 'cluster', distance: 444, desc: 'M45 · 七姐妹星团', alias: ['M45', '七姐妹', 'Pleiades'] },
  { id: 'beehive', name: '蜂巢星团', type: 'cluster', distance: 577, desc: 'M44 · 鬼宿星团', alias: ['M44', 'Beehive'] },
  { id: 'm13', name: '武仙座球状星团', type: 'cluster', distance: 22200, desc: 'M13 · 北天最亮球状星团', alias: ['M13'] },
  { id: 'omega-cen', name: '半人马座ω', type: 'cluster', distance: 15800, desc: '银河系最大球状星团', alias: ['Omega Centauri'] },

  // ---------- 星云 ----------
  { id: 'orion-nebula', name: '猎户座大星云', type: 'nebula', distance: 1344, desc: 'M42 · 恒星诞生之地', alias: ['M42', 'Orion Nebula'] },
  { id: 'dumbbell', name: '哑铃星云', type: 'nebula', distance: 1360, desc: 'M27 · 行星状星云', alias: ['M27', 'Dumbbell'] },
  { id: 'horsehead', name: '马头星云', type: 'nebula', distance: 1500, desc: '猎户座暗星云', alias: ['Horsehead'] },
  { id: 'ring-nebula', name: '环状星云', type: 'nebula', distance: 2570, desc: 'M57 · 行星状星云', alias: ['M57'] },
  { id: 'cat-eye', name: '猫眼星云', type: 'nebula', distance: 3300, desc: '结构最复杂的行星状星云', alias: ['Cat Eye'] },
  { id: 'butterfly', name: '蝴蝶星云', type: 'nebula', distance: 3400, desc: 'M2-9 · 双极星云', alias: ['Butterfly'] },
  { id: 'lagoon', name: '礁湖星云', type: 'nebula', distance: 4100, desc: 'M8 · 人马座发射星云', alias: ['M8', 'Lagoon'] },
  { id: 'trifid', name: '三叶星云', type: 'nebula', distance: 5200, desc: 'M20 · 发射与反射混合', alias: ['M20', 'Trifid'] },
  { id: 'rosette', name: '玫瑰星云', type: 'nebula', distance: 5200, desc: 'NGC 2237 · 花朵状星云', alias: ['Rosette'] },
  { id: 'crab-nebula', name: '蟹状星云', type: 'nebula', distance: 6500, desc: 'M1 · 超新星遗迹', alias: ['M1', 'Crab'] },
  { id: 'eagle-nebula', name: '鹰状星云', type: 'nebula', distance: 7000, desc: 'M16 · 创生之柱', alias: ['M16', '创生之柱'] },
  { id: 'carina', name: '船底座星云', type: 'nebula', distance: 7500, desc: 'NGC 3372 · 巨大恒星摇篮', alias: ['Carina'] },

  // ---------- 黑洞 / 特殊 ----------
  { id: 'cygnus-x1', name: '天鹅座 X-1', type: 'blackhole', distance: 6070, desc: '首个被确认的恒星级黑洞', alias: ['Cygnus X-1'] },
  { id: 'sagittarius-a', name: '人马座 A*', type: 'blackhole', distance: 26000, desc: '银河系中心超大质量黑洞', alias: ['Sgr A*', '银心黑洞'] },
  { id: 'm87', name: 'M87 黑洞', type: 'blackhole', distance: 53500000, desc: '首张被拍到的黑洞', alias: ['M87'] },
  { id: 'orion-arm', name: '猎户旋臂', type: 'special', distance: 0, desc: '太阳系所在的旋臂', alias: ['Orion Arm'] },
  { id: 'local-bubble', name: '本地泡', type: 'special', distance: 0, desc: '太阳系所在的低密度空腔', alias: ['Local Bubble'] },
  { id: 'local-cloud', name: '本星际云', type: 'special', distance: 0, desc: '太阳系正穿过的星际云', alias: ['Local Interstellar Cloud'] },
  { id: 'galactic-center', name: '银河系中心', type: 'special', distance: 26000, desc: '银心 · 恒星密集区', alias: ['银心', 'Galactic Center'] },
  { id: 'galactic-bar', name: '银河系棒', type: 'special', distance: 26000, desc: '贯穿银心的棒状结构', alias: ['Galactic Bar'] },
  { id: 'galactic-edge', name: '银河系边缘', type: 'special', distance: 75000, desc: '银盘外缘 · 恒星稀疏', alias: ['银盘边缘'] },

  // ---------- 星系 ----------
  { id: 'lmc', name: '大麦哲伦云', type: 'galaxy', distance: 163000, desc: '银河系最大伴星系', alias: ['LMC'] },
  { id: 'smc', name: '小麦哲伦云', type: 'galaxy', distance: 200000, desc: '银河系伴星系', alias: ['SMC'] },
  { id: 'andromeda', name: '仙女座星系', type: 'galaxy', distance: 2540000, desc: 'M31 · 本星系群最大星系', alias: ['M31', 'Andromeda'] },
  { id: 'triangulum', name: '三角座星系', type: 'galaxy', distance: 3000000, desc: 'M33 · 本星系群第三大', alias: ['M33'] },
  { id: 'centaurus-a', name: '半人马座 A', type: 'galaxy', distance: 13000000, desc: 'NGC 5128 · 活跃射电星系', alias: ['Centaurus A'] },
  { id: 'whirlpool', name: '涡状星系', type: 'galaxy', distance: 23000000, desc: 'M51 · 经典旋涡星系', alias: ['M51', 'Whirlpool'] },
  { id: 'sombrero', name: '草帽星系', type: 'galaxy', distance: 29300000, desc: 'M104 · 侧向旋涡星系', alias: ['M104', 'Sombrero'] },
  { id: 'virgo-cluster', name: '室女座星系团', type: 'galaxy', distance: 54000000, desc: '本超星系团核心', alias: ['Virgo Cluster'] },
  { id: 'laniakea', name: '拉尼亚凯亚超星系团', type: 'galaxy', distance: 520000000, desc: '银河系所属的超星系团', alias: ['Laniakea'] },

  // ---------- 空间站 ----------
  { id: 'earth-station', name: '地球同步星港', type: 'station', distance: 0.00026 * AU, desc: '近地轨道出发港', alias: ['星港', 'Earth Station'] },
  { id: 'lunar-base', name: '月球基地', type: 'station', distance: 0.00257 * AU, desc: '静海区永久定居点', alias: ['Lunar Base'] },
  { id: 'mars-colony', name: '火星殖民地', type: 'station', distance: 1.5 * AU, desc: '水手谷人类定居点', alias: ['Mars Colony'] },
  { id: 'europa-station', name: '木卫二冰下站', type: 'station', distance: 5.2 * AU, desc: '欧罗巴海洋研究站', alias: ['Europa Station'] },
  { id: 'warp-hub', name: '曲速中继站 K-7', type: 'station', distance: 320, desc: '星际航行补给与充能', alias: ['K-7', '中继站'] },
  { id: 'ds9', name: '深空九号', type: 'station', distance: 26000, desc: '银心轨道空间站 · 中转枢纽', alias: ['DS9', 'Deep Space 9'] },
  { id: 'academy', name: '星际舰队学院', type: 'station', distance: 0, desc: '旧金山 · 舰队人才摇篮', alias: ['星舰学院', 'Academy'] },
]

export const hotIds = [
  'moon',
  'mars',
  'europa',
  'proxima',
  'sirius',
  'orion-nebula',
  'sagittarius-a',
  'cygnus-x1',
]

// ---------- 交通方式 ----------
const C = 1079252848.8 // 光速 km/h

export const transports = [
  { id: 'walk', label: '步行', icon: '🚶', speed: 5, speedText: '5 km/h' },
  { id: 'rocket', label: '火箭', icon: '🚀', speed: 58000, speedText: '5.8 万 km/h' },
  { id: 'carpool', label: '顺风船', icon: '🛸', speed: 0.01 * C, speedText: '0.01 c' },
  { id: 'warp', label: '曲速引擎', icon: '⚡', speed: C, speedText: '≈ 1.0 c', expandable: true },
]

export function getTransport(id) {
  return transports.find((t) => t.id === id) || transports[3]
}

// ---------- 查询 ----------
export function getLocation(id) {
  return locations.find((l) => l.id === id) || locations[0]
}

export function searchLocations(query, categoryId = 'all') {
  const q = query.trim().toLowerCase()
  let list = locations
  if (categoryId !== 'all') list = list.filter((l) => l.type === categoryId)
  if (!q) return list
  return list.filter((l) => {
    const hay = [l.name, l.desc, typeMeta[l.type].label, ...(l.alias || [])]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

// ---------- 单位换算 ----------
const LY_KM = 9.4607e12

export function formatDistance(ly) {
  const km = ly * LY_KM
  if (km < 1) return `${Math.max(0, Math.round(km * 1000))} 米`
  if (km < 10000) return `${Math.round(km)} 公里`
  if (km < 1e8) return `${(km / 1e4).toFixed(1)} 万公里`
  if (ly < 0.1) return `${(km / 1e8).toFixed(1)} 亿公里`
  if (ly < 1e4) return `${+ly.toFixed(2)} 光年`
  if (ly < 1e8) return `${(ly / 1e4).toFixed(1)} 万光年`
  return `${(ly / 1e8).toFixed(2)} 亿光年`
}

export function splitDistance(ly) {
  const km = ly * LY_KM
  if (km < 1) return { value: `${Math.max(0, Math.round(km * 1000))}`, unit: '米' }
  if (km < 10000) return { value: `${Math.round(km)}`, unit: '公里' }
  if (km < 1e8) return { value: (km / 1e4).toFixed(1), unit: '万公里' }
  if (ly < 0.1) return { value: (km / 1e8).toFixed(1), unit: '亿公里' }
  if (ly < 1e4) return { value: `${+ly.toFixed(2)}`, unit: '光年' }
  if (ly < 1e8) return { value: (ly / 1e4).toFixed(1), unit: '万光年' }
  return { value: (ly / 1e8).toFixed(2), unit: '亿光年' }
}

export function formatDuration(hours) {
  if (hours <= 0) return '即将到达'
  const seconds = hours * 3600
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} 秒`
  const minutes = hours * 60
  if (minutes < 60) return `${Math.round(minutes)} 分钟`
  if (hours < 24) return `${Math.round(hours)} 小时`
  const days = hours / 24
  if (days < 365) return `${Math.round(days)} 天`
  const years = days / 365.25
  if (years < 100) {
    const y = Math.floor(years)
    const m = Math.round((years - y) * 12)
    if (y <= 0) return `${Math.max(1, m)} 个月`
    return m > 0 ? `${y} 年 ${m} 个月` : `${y} 年`
  }
  if (years < 1e4) return `${Math.round(years)} 年`
  if (years < 1e8) return `${(years / 1e4).toFixed(1)} 万年`
  return `${(years / 1e8).toFixed(2)} 亿年`
}

// ---------- 路线计算 ----------
// 按行程距离分层，近地/太阳系内不提供虫洞等不合理的航线
const TIER_ROUTES = {
  solar: [
    { id: 'direct', dFactor: 1.0, desc: '直线直达', tag: '最快', tagIcon: '🚀', color: '#22c55e' },
    { id: 'slingshot', dFactor: 1.12, desc: '借助行星引力加速', tag: '省燃料', tagIcon: '🪐', color: '#2f9bff' },
    { id: 'fuel', dFactor: 1.06, desc: '低推力霍曼转移', tag: '省料省心', tagIcon: '⛽', color: '#f59e0b' },
    { id: 'scenic', dFactor: 1.28, desc: '绕行观景', tag: '风景超赞', tagIcon: '🌌', color: '#8b5cf6' },
  ],
  interstellar: [
    { id: 'classic', dFactor: 1.0, desc: '经典航线 · 稳定', tag: '风景超赞', tagIcon: '🌌', color: '#2f9bff' },
    { id: 'wormhole', dFactor: 1.07, desc: '虫洞较少', tag: '颠簸更小', tagIcon: '🕳️', color: '#8b5cf6' },
    { id: 'express', dFactor: 0.95, desc: '星际拥堵低', tag: '畅行无阻', tagIcon: '🛸', color: '#22c55e' },
    { id: 'eco', dFactor: 1.05, desc: '最省能耗', tag: '省料省心', tagIcon: '🪐', color: '#f59e0b' },
  ],
  deep: [
    { id: 'classic', dFactor: 1.0, desc: '经典航线 · 稳定', tag: '风景超赞', tagIcon: '🌌', color: '#2f9bff' },
    { id: 'wormhole', dFactor: 0.62, desc: '穿越虫洞', tag: '大幅缩短', tagIcon: '🕳️', color: '#8b5cf6' },
    { id: 'hyperspace', dFactor: 0.35, desc: '超空间跳跃', tag: '超光速', tagIcon: '🌀', color: '#a855f7' },
    { id: 'eco', dFactor: 1.05, desc: '最省能耗', tag: '省料省心', tagIcon: '🪐', color: '#f59e0b' },
  ],
}

export function routeTier(distanceLy) {
  if (distanceLy < 0.01) return 'solar'
  if (distanceLy < 1000) return 'interstellar'
  return 'deep'
}

export function computeRoutes(distanceLy, transport) {
  const t = transport || transports[3]
  const base = Math.max(distanceLy, 0)
  const tier = routeTier(base)
  return TIER_ROUTES[tier].map((r) => {
    const d = base * r.dFactor
    const hours = (d * LY_KM) / t.speed
    const split = splitDistance(d)
    return {
      id: r.id,
      distance: formatDistance(d),
      distanceNum: split.value,
      distanceUnit: split.unit,
      distanceLy: d,
      hours,
      durationText: formatDuration(hours),
      eta: `预计 ${formatDuration(hours)}到达`,
      desc: r.desc,
      tag: r.tag,
      tagIcon: r.tagIcon,
      color: r.color,
    }
  })
}
