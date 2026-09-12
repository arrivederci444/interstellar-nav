<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { AU, getLocationPosition, SOLAR, starCatalog } from '../data/stars.js'
import { locations, typeMeta } from '../data/galaxy.js'

const props = defineProps({
  route: { type: Object, required: true },
  origin: { type: Object, required: true },
  destination: { type: Object, required: true },
  waypoints: { type: Array, default: () => [] },
  rocketFlying: { type: Boolean, default: false },
  launchKey: { type: Number, default: 0 },
  navigating: { type: Boolean, default: false },
  navProgress: { type: Number, default: 0 },
  immersive: { type: Boolean, default: false },
})

const emit = defineEmits(['locate', 'action', 'preference', 'toggle-immersive', 'map-interact'])

const containerEl = ref(null)
const labelsEl = ref(null)
const spinning = ref(false)
const zoomLevel = ref('银河系')
const scaleMenuOpen = ref(false)

const scaleOptions = [
  { id: 'solar', label: '太阳系', icon: '☀️' },
  { id: 'stellar', label: '恒星邻域', icon: '⭐' },
  { id: 'interstellar', label: '星际邻域', icon: '✨' },
  { id: 'galaxy', label: '银河系', icon: '🌌' },
  { id: 'universe', label: '宇宙尺度', icon: '🪐' },
]

const SCALE_PRESETS = {
  solar: { target: [0, 0, 0], dist: 1.4e-4, dir: [0.45, 0.55, 0.7] },
  stellar: { target: [0, 0, 0], dist: 12, dir: [0.45, 0.55, 0.7] },
  interstellar: { target: [0, 0, 0], dist: 2500, dir: [0.45, 0.55, 0.7] },
  galaxy: { target: [26000, 0, 0], dist: 175000, dir: [0.3, 0.85, 0.45] },
  universe: { target: [0, 0, 0], dist: 6e6, dir: [0.4, 0.6, 0.7] },
}

function selectScale(id) {
  scaleMenuOpen.value = false
  jumpTo(id)
}

const GALAXY_CENTER_LY = 26000
const DEG = Math.PI / 180

let renderer
let labelRenderer
let scene
let camera
let controls
let raf = 0
let routeGroup
let galaxyGroup
let galaxyDisk = null
let galaxyCore = null
let starsGroup
let universeGroup
let universeLabels = []
let solarGroup
let routeLine = null
let routeGlow = null
let rocket
let originLabelObj
let destLabelObj
let planetLabels = []
let planetMeshes = []
let routeLabelObjs = []
let currentCurve = null
let lastPts = null
let maxExtent = 52000
const tweenState = {
  active: false,
  t0: 0,
  dur: 0,
  target0: new THREE.Vector3(),
  target1: new THREE.Vector3(),
  dir0: new THREE.Vector3(0, 0, 1),
  dir1: new THREE.Vector3(0, 0, 1),
  dist0: 1,
  dist1: 1,
}
let launchT = -1
let launchStart = 0
let disposed = false

const PLANETS = [
  { id: 'mercury', name: '水星', color: '#b8b0a8', rKm: 2440 },
  { id: 'venus', name: '金星', color: '#e8c88a', rKm: 6052 },
  { id: 'earth', name: '地球', color: '#4a90e2', rKm: 6371, moonKm: 384400 },
  { id: 'mars', name: '火星', color: '#c1541f', rKm: 3390, moonKm: 9376 },
  { id: 'jupiter', name: '木星', color: '#d8b48a', rKm: 69911, moonKm: 421700 },
  { id: 'saturn', name: '土星', color: '#e0cf9a', rKm: 58232, moonKm: 238020 },
  { id: 'uranus', name: '天王星', color: '#9fe3e8', rKm: 25362, moonKm: 129900 },
  { id: 'neptune', name: '海王星', color: '#4a6fd8', rKm: 24622, moonKm: 354759 },
]

const KM_TO_LY = 1 / 9.4607e12

function gauss() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function galacticFromRaDec(raHours, decDeg, dist) {
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
  const l = lNcp - Math.atan2(y, x)
  return {
    x: dist * Math.cos(b) * Math.cos(l),
    y: dist * Math.sin(b),
    z: dist * Math.cos(b) * Math.sin(l),
  }
}

function makeLabel(text, cls, dotColor) {
  const el = document.createElement('div')
  el.className = cls
  if (dotColor) {
    const dot = document.createElement('i')
    dot.className = 'g-dot'
    dot.style.background = dotColor
    el.appendChild(dot)
  }
  const span = document.createElement('span')
  span.textContent = text
  el.appendChild(span)
  return new CSS2DObject(el)
}

function makeGlowTexture(stops) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  stops.forEach(([o, col]) => grad.addColorStop(o, col))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

function makeGalaxyTexture() {
  const S = 1024
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  const cx = S / 2
  const cy = S / 2
  const maxR = S * 0.47

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.15)
  g.addColorStop(0, 'rgba(255,244,214,0.95)')
  g.addColorStop(0.3, 'rgba(255,214,150,0.6)')
  g.addColorStop(0.65, 'rgba(255,190,130,0.2)')
  g.addColorStop(1, 'rgba(255,180,120,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, S * 0.15, 0, Math.PI * 2)
  ctx.fill()

  const diskGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR)
  diskGrad.addColorStop(0, 'rgba(150,175,255,0.14)')
  diskGrad.addColorStop(0.45, 'rgba(110,140,240,0.09)')
  diskGrad.addColorStop(1, 'rgba(70,100,210,0)')
  ctx.fillStyle = diskGrad
  ctx.beginPath()
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2)
  ctx.fill()

  const arms = 4
  for (let a = 0; a < arms; a += 1) {
    const off = a * ((Math.PI * 2) / arms)
    for (let i = 0; i < 6000; i += 1) {
      const t = Math.random()
      const r = 46 + (maxR - 46) * Math.pow(t, 0.62)
      const theta = off + Math.log(r / 46) * 2.6 + (Math.random() - 0.5) * 0.55
      const x = cx + Math.cos(theta) * r + gauss() * r * 0.05
      const y = cy + Math.sin(theta) * r + gauss() * r * 0.05
      const mix = r / maxR
      const cr = Math.round(255 - mix * 90)
      const cg = Math.round(230 - mix * 30)
      ctx.fillStyle = `rgba(${cr},${cg},255,${0.14 + Math.random() * 0.34})`
      ctx.beginPath()
      ctx.arc(x, y, 1 + Math.random() * 2.6, 0, Math.PI * 2)
      ctx.fill()
      if (Math.random() < 0.012) {
        ctx.fillStyle = 'rgba(255,120,175,0.55)'
        ctx.beginPath()
        ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  ctx.globalCompositeOperation = 'destination-out'
  for (let a = 0; a < arms; a += 1) {
    const off = a * ((Math.PI * 2) / arms)
    for (let i = 0; i < 900; i += 1) {
      const t = Math.random()
      const r = 80 + (maxR * 0.95 - 80) * Math.pow(t, 0.7)
      const theta = off + Math.log(r / 46) * 2.6 - 0.28 + (Math.random() - 0.5) * 0.06
      const x = cx + Math.cos(theta) * r
      const y = cy + Math.sin(theta) * r
      ctx.fillStyle = `rgba(0,0,0,${0.12 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.arc(x, y, 3 + Math.random() * 7, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalCompositeOperation = 'source-over'

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

function buildGalaxy() {
  const group = new THREE.Group()
  const arms = 4
  const N = 12000
  const NC = 3200
  const NH = 1200
  const total = N + NC + NH
  const pos = new Float32Array(total * 3)
  const col = new Float32Array(total * 3)
  const cCore = new THREE.Color('#ffd9a0')
  const cMid = new THREE.Color('#bcd0ff')
  const cOut = new THREE.Color('#6f8fe0')
  const cHii = new THREE.Color('#ff6b9d')
  const rMin = 2500
  const rMax = 50000
  let p = 0
  for (let i = 0; i < N; i += 1) {
    const arm = i % arms
    const t = Math.random()
    const r = rMin + (rMax - rMin) * Math.pow(t, 0.7)
    const theta =
      arm * ((Math.PI * 2) / arms) +
      ((r - rMin) / (rMax - rMin)) * 3.6 +
      gauss() * 0.28
    const spread = 0.09 + (r / rMax) * 0.06
    pos[p * 3] = Math.cos(theta) * r + gauss() * r * spread
    pos[p * 3 + 1] = gauss() * (700 + r * 0.02)
    pos[p * 3 + 2] = Math.sin(theta) * r + gauss() * r * spread
    const mix = Math.min(1, r / rMax)
    const c = cCore.clone().lerp(cMid, Math.min(1, r / 16000)).lerp(cOut, mix * 0.6)
    const dim = 0.4 + 0.6 * (1 - mix)
    col[p * 3] = c.r * dim
    col[p * 3 + 1] = c.g * dim
    col[p * 3 + 2] = c.b * dim
    p += 1
  }
  for (let i = 0; i < NC; i += 1) {
    const r = Math.abs(gauss()) * 2600
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    pos[p * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[p * 3 + 1] = r * Math.cos(phi) * 0.55
    pos[p * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    const c = cCore.clone()
    const dim = 0.22 + 0.22 * (1 - r / 2600)
    col[p * 3] = c.r * dim
    col[p * 3 + 1] = c.g * dim
    col[p * 3 + 2] = c.b * dim
    p += 1
  }
  for (let i = 0; i < NH; i += 1) {
    const arm = i % arms
    const t = Math.random()
    const r = 6000 + (rMax - 6000) * Math.pow(t, 0.8)
    const theta =
      arm * ((Math.PI * 2) / arms) + ((r - rMin) / (rMax - rMin)) * 3.6 + gauss() * 0.12
    pos[p * 3] = Math.cos(theta) * r + gauss() * 900
    pos[p * 3 + 1] = gauss() * 260
    pos[p * 3 + 2] = Math.sin(theta) * r + gauss() * 900
    const c = cHii.clone().lerp(cCore, Math.random() * 0.35)
    const dim = 0.5 + Math.random() * 0.5
    col[p * 3] = c.r * dim
    col[p * 3 + 1] = c.g * dim
    col[p * 3 + 2] = c.b * dim
    p += 1
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.PointsMaterial({
    size: 1.3,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  group.add(new THREE.Points(geo, mat))

  const tex = makeGlowTexture([
    [0, 'rgba(255,228,185,0.8)'],
    [0.28, 'rgba(190,205,255,0.28)'],
    [0.62, 'rgba(110,140,255,0.08)'],
    [1, 'rgba(60,90,220,0)'],
  ])
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.14,
    }),
  )
  sprite.scale.set(12000, 12000, 1)
  group.add(sprite)
  galaxyCore = sprite

  // 真实感银河盘面贴图
  const diskGeo = new THREE.PlaneGeometry(104000, 104000)
  const diskMat = new THREE.MeshBasicMaterial({
    map: makeGalaxyTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: 0.92,
  })
  galaxyDisk = new THREE.Mesh(diskGeo, diskMat)
  galaxyDisk.rotation.x = -Math.PI / 2
  group.add(galaxyDisk)

  group.position.set(GALAXY_CENTER_LY, 0, 0)
  return group
}

function buildNearbyStars() {
  const group = new THREE.Group()
  const n = starCatalog.length
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const c = new THREE.Color()
  starCatalog.forEach((s, i) => {
    const p2 = galacticFromRaDec(s.ra, s.dec, s.dist)
    pos[i * 3] = p2.x
    pos[i * 3 + 1] = p2.y
    pos[i * 3 + 2] = p2.z
    c.set(s.color)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.PointsMaterial({
    size: 2.6,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  group.add(new THREE.Points(geo, mat))
  return group
}

function makePlanetTexture(pl) {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = pl.color
  ctx.fillRect(0, 0, S, S)
  const name = pl.name

  if (name === '地球') {
    ctx.fillStyle = '#1b4f9c'
    ctx.fillRect(0, 0, S, S)
    for (let i = 0; i < 90; i += 1) {
      const x = Math.random() * S
      const y = Math.random() * S
      const r = 8 + Math.random() * 30
      ctx.fillStyle = Math.random() < 0.7 ? '#2e7d4f' : '#8a7b45'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    for (let i = 0; i < 40; i += 1) {
      ctx.beginPath()
      ctx.ellipse(Math.random() * S, Math.random() * S, 14 + Math.random() * 22, 5 + Math.random() * 8, Math.random() * 3, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (name === '木星' || name === '土星') {
    const bands = name === '木星' ? 14 : 10
    for (let i = 0; i < bands; i += 1) {
      const y = (i / bands) * S
      const light = i % 2 === 0
      ctx.fillStyle = light
        ? name === '木星'
          ? 'rgba(238,214,180,0.9)'
          : 'rgba(240,228,190,0.9)'
        : name === '木星'
          ? 'rgba(178,128,88,0.9)'
          : 'rgba(198,178,132,0.9)'
      ctx.fillRect(0, y, S, S / bands + 1)
    }
    for (let i = 0; i < 60; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`
      ctx.fillRect(0, Math.random() * S, S, 2 + Math.random() * 4)
    }
    if (name === '木星') {
      ctx.fillStyle = 'rgba(196,88,60,0.9)'
      ctx.beginPath()
      ctx.ellipse(S * 0.62, S * 0.6, 26, 14, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (name === '火星') {
    ctx.fillStyle = '#b3481d'
    ctx.fillRect(0, 0, S, S)
    for (let i = 0; i < 120; i += 1) {
      ctx.fillStyle = Math.random() < 0.6 ? 'rgba(120,50,25,0.5)' : 'rgba(200,110,60,0.5)'
      ctx.beginPath()
      ctx.arc(Math.random() * S, Math.random() * S, 3 + Math.random() * 14, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillRect(0, 0, S, 12)
    ctx.fillRect(0, S - 12, S, 12)
  } else if (name === '水星') {
    for (let i = 0; i < 220; i += 1) {
      const g2 = Math.random() < 0.5 ? 'rgba(120,116,110,0.6)' : 'rgba(180,176,168,0.5)'
      ctx.fillStyle = g2
      ctx.beginPath()
      ctx.arc(Math.random() * S, Math.random() * S, 2 + Math.random() * 10, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (name === '金星') {
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = `rgba(255,240,190,${0.1 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.ellipse(Math.random() * S, Math.random() * S, 20 + Math.random() * 40, 6 + Math.random() * 12, Math.random(), 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (name === '海王星') {
    ctx.fillStyle = '#3a63c8'
    ctx.fillRect(0, 0, S, S)
    ctx.fillStyle = 'rgba(20,30,80,0.7)'
    ctx.beginPath()
    ctx.ellipse(S * 0.4, S * 0.55, 30, 18, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 通用噪声
  for (let i = 0; i < 1500; i += 1) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * S, Math.random() * S, 2, 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

function makeRingTexture() {
  const w = 256
  const h = 16
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  for (let x = 0; x < w; x += 1) {
    const t = x / w
    let a = 0.45 + 0.4 * Math.abs(Math.sin(t * 42))
    if (t > 0.6 && t < 0.67) a *= 0.08
    if (t > 0.3 && t < 0.34) a *= 0.35
    if (t < 0.06 || t > 0.97) a *= 0.2
    ctx.fillStyle = `rgba(232,218,184,${Math.max(0, a)})`
    ctx.fillRect(x, 0, 1, h)
  }
  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

function makeGalaxySpriteTexture(kind) {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  const cx = S / 2
  const cy = S / 2

  if (kind === 'elliptical') {
    for (let i = 0; i < 5; i += 1) {
      const r = S * (0.42 - i * 0.07)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, 'rgba(255,236,200,0.5)')
      g.addColorStop(0.5, 'rgba(255,214,160,0.18)')
      g.addColorStop(1, 'rgba(255,190,130,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(cx, cy, r, r * 0.72, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (kind === 'irregular') {
    for (let i = 0; i < 260; i += 1) {
      const a = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.6) * S * 0.4
      const x = cx + Math.cos(a) * r + gauss() * 12
      const y = cy + Math.sin(a) * r + gauss() * 12
      ctx.fillStyle = `rgba(200,220,255,${0.05 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.arc(x, y, 1 + Math.random() * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (kind === 'edgeon') {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.45)
    g.addColorStop(0, 'rgba(255,240,210,0.9)')
    g.addColorStop(0.4, 'rgba(255,220,170,0.4)')
    g.addColorStop(1, 'rgba(255,200,140,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(cx, cy, S * 0.46, S * 0.14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(60,40,30,0.5)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, S * 0.42, S * 0.045, 0, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // 旋涡星系
    const arms = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < 4200; i += 1) {
      const t = Math.random()
      const r = 8 + Math.pow(t, 0.6) * S * 0.42
      const arm = i % arms
      const theta = arm * ((Math.PI * 2) / arms) + Math.log(r / 8) * 2.4 + gauss() * 0.4
      const x = cx + Math.cos(theta) * r
      const y = cy + Math.sin(theta) * r * 0.85
      const mix = r / (S * 0.45)
      ctx.fillStyle = `rgba(${Math.round(255 - mix * 70)},${Math.round(225 - mix * 20)},255,${0.12 + Math.random() * 0.34})`
      ctx.beginPath()
      ctx.arc(x, y, 0.8 + Math.random() * 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.18)
    g.addColorStop(0, 'rgba(255,242,210,0.95)')
    g.addColorStop(1, 'rgba(255,210,150,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, S * 0.18, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

function buildUniverse() {
  const group = new THREE.Group()
  const far = locations.filter((l) => l.distance >= 1e5)
  const n = far.length
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  const c = new THREE.Color()
  far.forEach((l, i) => {
    const p = getLocationPosition(l)
    pos[i * 3] = p.x
    pos[i * 3 + 1] = p.y
    pos[i * 3 + 2] = p.z
    const meta = typeMeta[l.type] || typeMeta.galaxy
    c.set(meta.color)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.PointsMaterial({
    size: 5,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  group.add(new THREE.Points(geo, mat))

  // 附近星系（真实赤经赤纬/距离，按真实直径做贴图精灵，略作放大以便观看）
  const EXTRA_GALAXIES = [
    { name: '仙女座星系', ra: 0.712, dec: 41.269, dist: 2.54e6, size: 220000, kind: 'spiral' },
    { name: '三角座星系', ra: 1.564, dec: 30.66, dist: 3.0e6, size: 60000, kind: 'spiral' },
    { name: 'M32', ra: 0.711, dec: 40.865, dist: 2.49e6, size: 6500, kind: 'elliptical' },
    { name: 'M110', ra: 0.671, dec: 41.685, dist: 2.69e6, size: 17000, kind: 'elliptical' },
    { name: '大麦哲伦云', ra: 5.392, dec: -69.756, dist: 163000, size: 14000, kind: 'irregular' },
    { name: '小麦哲伦云', ra: 0.879, dec: -72.829, dist: 200000, size: 7000, kind: 'irregular' },
    { name: 'NGC 6822', ra: 19.749, dec: -14.803, dist: 1.6e6, size: 7000, kind: 'irregular' },
    { name: 'IC 1613', ra: 1.079, dec: 2.133, dist: 2.4e6, size: 10000, kind: 'irregular' },
    { name: '玉夫座矮星系', ra: 0.879, dec: -33.708, dist: 2.9e5, size: 5000, kind: 'elliptical' },
    { name: 'NGC 300', ra: 0.908, dec: -37.685, dist: 6.1e6, size: 94000, kind: 'spiral' },
    { name: 'NGC 55', ra: 0.248, dec: -39.196, dist: 6.5e6, size: 70000, kind: 'spiral' },
    { name: 'M81', ra: 9.926, dec: 69.065, dist: 1.18e7, size: 90000, kind: 'spiral' },
    { name: 'M82', ra: 9.931, dec: 69.68, dist: 1.2e7, size: 37000, kind: 'edgeon' },
    { name: '半人马座 A', ra: 13.426, dec: -43.019, dist: 1.3e7, size: 60000, kind: 'elliptical' },
    { name: '涡状星系', ra: 13.498, dec: 47.195, dist: 2.3e7, size: 76000, kind: 'spiral' },
    { name: '风车星系', ra: 14.053, dec: 54.349, dist: 2.1e7, size: 170000, kind: 'spiral' },
    { name: '南风车星系', ra: 13.617, dec: -29.866, dist: 1.5e7, size: 60000, kind: 'spiral' },
    { name: '草帽星系', ra: 12.667, dec: -11.623, dist: 2.93e7, size: 50000, kind: 'edgeon' },
    { name: 'M87', ra: 12.514, dec: 12.391, dist: 5.35e7, size: 240000, kind: 'elliptical' },
    { name: '室女座星系团', ra: 12.5, dec: 12.5, dist: 5.4e7, size: 6000000, kind: 'elliptical' },
    { name: '拉尼亚凯亚', ra: 10.0, dec: -46.0, dist: 5.2e8, size: 200000000, kind: 'elliptical' },
  ]
  universeLabels = []
  const GALAXY_STYLE = {
    lmc: { size: 14000, kind: 'irregular' },
    smc: { size: 7000, kind: 'irregular' },
    andromeda: { size: 220000, kind: 'spiral' },
    triangulum: { size: 60000, kind: 'spiral' },
    'centaurus-a': { size: 60000, kind: 'elliptical' },
    whirlpool: { size: 76000, kind: 'spiral' },
    sombrero: { size: 50000, kind: 'edgeon' },
    'virgo-cluster': { size: 6000000, kind: 'elliptical' },
    laniakea: { size: 200000000, kind: 'elliptical' },
  }
  const addGalaxy = (name, p, size, kind) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGalaxySpriteTexture(kind),
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 1,
      }),
    )
    sprite.position.set(p.x, p.y, p.z)
    sprite.scale.set(size * 1.6, size * 1.6, 1)
    group.add(sprite)
    const lab = makeLabel(name, 'g-label g-galaxy')
    lab.position.set(p.x, p.y, p.z)
    lab.userData = { name }
    group.add(lab)
    universeLabels.push(lab)
  }

  const seen = new Set()
  // 数据里所有「星系」类型都出贴图
  locations
    .filter((l) => l.type === 'galaxy')
    .forEach((l) => {
      const st = GALAXY_STYLE[l.id] || { size: 50000, kind: 'spiral' }
      addGalaxy(l.name, getLocationPosition(l), st.size, st.kind)
      seen.add(l.name)
    })
  // 补充更多附近星系
  EXTRA_GALAXIES.forEach((g) => {
    if (seen.has(g.name)) return
    addGalaxy(g.name, galacticFromRaDec(g.ra, g.dec, g.dist), g.size, g.kind)
  })
  return group
}

function buildSolarSystem() {
  const group = new THREE.Group()
  planetLabels = []
  planetMeshes = []

  // 太阳
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.4e-6, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffe08a }),
  )
  group.add(sun)
  const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeGlowTexture([
        [0, 'rgba(255,236,190,0.9)'],
        [0.3, 'rgba(255,200,110,0.35)'],
        [1, 'rgba(255,170,60,0)'],
      ]),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  sunGlow.scale.set(4e-6, 4e-6, 1)
  group.add(sunGlow)

  const sunLight = new THREE.PointLight(0xfff0d0, 3.2, 0, 0)
  group.add(sunLight)
  group.add(new THREE.AmbientLight(0x3a4a72, 1.1))
  const sunLabel = makeLabel('太阳', 'g-label g-sun')
  sunLabel.position.set(0, 0, 0)
  sunLabel.userData = { name: '太阳' }
  group.add(sunLabel)
  planetLabels.push(sunLabel)

  PLANETS.forEach((pl) => {
    const orbit = SOLAR[pl.id]
    const r = orbit.a * AU
    const ang = orbit.ang
    // 轨道
    const pts = []
    const seg = 160
    for (let i = 0; i <= seg; i += 1) {
      const a = (i / seg) * Math.PI * 2
      pts.push(r * Math.cos(a), 0, r * Math.sin(a))
    }
    const oGeo = new THREE.BufferGeometry()
    oGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    const oMat = new THREE.LineBasicMaterial({
      color: 0x6f8fe0,
      transparent: true,
      opacity: 0.35,
    })
    group.add(new THREE.Line(oGeo, oMat))

    // 行星（单位球，逐帧按相机距离缩放，且不超过最近卫星轨道）
    const realR = pl.rKm * KM_TO_LY
    const capR = pl.moonKm
      ? Math.max(pl.moonKm * 0.35, pl.rKm) * KM_TO_LY
      : pl.rKm * 60 * KM_TO_LY
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 24),
      new THREE.MeshStandardMaterial({ map: makePlanetTexture(pl), roughness: 1, metalness: 0 }),
    )
    planet.position.set(r * Math.cos(ang), 0, r * Math.sin(ang))
    planet.scale.setScalar(realR)
    group.add(planet)
    planetMeshes.push({ mesh: planet, realR, capR })

    // 土星环（单位半径，随行星缩放）
    if (pl.id === 'saturn') {
      const inner = 1.35
      const outer = 2.35
      const ringGeo = new THREE.RingGeometry(inner, outer, 96, 1)
      const rp = ringGeo.attributes.position
      const ruv = ringGeo.attributes.uv
      const v = new THREE.Vector3()
      for (let i = 0; i < rp.count; i += 1) {
        v.fromBufferAttribute(rp, i)
        const rr = v.length()
        ruv.setXY(i, (rr - inner) / (outer - inner), 0.5)
      }
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({
          map: makeRingTexture(),
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          opacity: 0.9,
        }),
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.copy(planet.position)
      ring.scale.setScalar(realR)
      group.add(ring)
      planetMeshes[planetMeshes.length - 1].ring = ring
    }

    const label = makeLabel(pl.name, 'g-label g-planet')
    label.position.copy(planet.position)
    label.userData = { name: pl.name }
    group.add(label)
    planetLabels.push(label)
  })

  group.visible = true
  return group
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop()
    child.traverse?.((o) => {
      o.geometry?.dispose?.()
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.())
      else o.material?.dispose?.()
      if (o.element && typeof o.element.remove === 'function') o.element.remove()
    })
    group.remove(child)
  }
}

function setRocketAt(t) {
  if (!currentCurve || !rocket) return
  const tt = Math.min(1, Math.max(0, t))
  const point = currentCurve.getPointAt(tt)
  const tan = currentCurve.getTangentAt(Math.min(0.999, Math.max(0.001, tt))).normalize()
  rocket.position.copy(point)
  rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan)
}

function buildRouteObjects(points) {
  const O = points[0]
  const D = points[points.length - 1]
  const dist = Math.max(O.distanceTo(D), 1e-9)
  let curve
  if (points.length === 2) {
    const dir = D.clone().sub(O)
    if (dir.lengthSq() < 1e-20) dir.set(1, 0, 0)
    dir.normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const perp = new THREE.Vector3().crossVectors(dir, up)
    if (perp.lengthSq() < 1e-12) perp.set(1, 0, 0)
    perp.normalize()
    const variant =
      {
        classic: 0.18,
        wormhole: -0.3,
        express: 0.08,
        eco: 0.24,
        direct: 0.04,
        slingshot: -0.14,
        fuel: 0.2,
        scenic: 0.34,
        hyperspace: 0.0,
      }[props.route.id] ?? 0.18
    const control = O.clone().lerp(D, 0.5).add(perp.multiplyScalar(dist * variant))
    curve = new THREE.QuadraticBezierCurve3(O, control, D)
  } else {
    curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
  }
  currentCurve = curve

  const pts = curve.getPoints(120)
  const flat = []
  pts.forEach((pt) => flat.push(pt.x, pt.y, pt.z))

  const geo = new LineGeometry()
  geo.setPositions(flat)
  const mat = new LineMaterial({
    color: 0x2fd06a,
    linewidth: 4,
    worldUnits: false,
    dashed: false,
    transparent: true,
    opacity: 1,
  })
  mat.resolution.set(containerEl.value.clientWidth, containerEl.value.clientHeight)
  routeLine = new Line2(geo, mat)
  routeLine.computeLineDistances()
  routeGroup.add(routeLine)

  const geo2 = new LineGeometry()
  geo2.setPositions(flat)
  const mat2 = new LineMaterial({
    color: 0x3ee27c,
    linewidth: 11,
    worldUnits: false,
    transparent: true,
    opacity: 0.16,
  })
  mat2.resolution.copy(mat.resolution)
  routeGlow = new Line2(geo2, mat2)
  routeGroup.add(routeGlow)
}

function rebuildRoute(immediate) {
  clearGroup(routeGroup)
  const locs = [props.origin, ...props.waypoints, props.destination]
  const pts = locs.map((loc) => {
    const p = getLocationPosition(loc)
    return new THREE.Vector3(p.x, p.y, p.z)
  })
  const O = pts[0]
  const D = pts[pts.length - 1]
  lastPts = pts.map((p) => p.clone())
  let ext = 52000
  pts.forEach((p) => {
    ext = Math.max(ext, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z))
  })
  maxExtent = ext

  buildRouteObjects(pts)

  originLabelObj = makeLabel(props.origin.name, 'g-label g-origin', '#2fd06a')
  originLabelObj.position.copy(O)
  routeGroup.add(originLabelObj)
  destLabelObj = makeLabel(props.destination.name, 'g-label g-dest', '#ff4d4f')
  destLabelObj.position.copy(D)
  routeGroup.add(destLabelObj)
  routeLabelObjs = [originLabelObj, destLabelObj]
  props.waypoints.forEach((w, i) => {
    const wp = pts[i + 1]
    if (!wp) return
    const wl = makeLabel(w.name, 'g-label g-waypoint', '#7fb4ff')
    wl.position.copy(wp)
    routeGroup.add(wl)
    routeLabelObjs.push(wl)
  })

  frameCamera(pts, immediate)
}

function flyTo(target, dist, dir, dur) {
  if (!camera || !controls) return
  if (!dur || dur <= 0) {
    const d = dir.clone().normalize().multiplyScalar(Math.max(dist, 1e-9))
    controls.target.copy(target)
    camera.position.copy(target).add(d)
    controls.update()
    tweenState.active = false
    return
  }
  const off = camera.position.clone().sub(controls.target)
  tweenState.target0.copy(controls.target)
  tweenState.target1.copy(target)
  tweenState.dir0.copy(off.lengthSq() > 0 ? off.normalize() : new THREE.Vector3(0, 0, 1))
  tweenState.dir1.copy(dir).normalize()
  tweenState.dist0 = Math.max(off.length(), 1e-9)
  tweenState.dist1 = Math.max(dist, 1e-9)
  tweenState.t0 = performance.now()
  tweenState.dur = dur
  tweenState.active = true
}

function frameCamera(pts, immediate) {
  const O = pts[0]
  const D = pts[pts.length - 1]
  const box = new THREE.Box3().setFromPoints(pts)
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  const center = sphere.center.clone()
  const radius = Math.max(sphere.radius, 1e-9)
  const fov = (camera.fov * Math.PI) / 180
  const fitH = radius / Math.sin(fov / 2)
  const fitW = radius / Math.sin(Math.atan(Math.tan(fov / 2) * camera.aspect))
  const distance = Math.max(fitH, fitW) * 1.75

  const dir = D.clone().sub(O)
  if (dir.lengthSq() < 1e-20) dir.set(1, 0, 0)
  dir.normalize()
  const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0))
  if (side.lengthSq() < 1e-12) side.set(1, 0, 0)
  side.normalize()
  const viewDir = side
    .clone()
    .add(new THREE.Vector3(0, 0.5, 0))
    .add(dir.clone().multiplyScalar(-0.15))
    .normalize()

  flyTo(center, distance, viewDir, immediate ? 0 : 900)
}

function jumpTo(preset) {
  if (preset === 'route') {
    if (lastPts) frameCamera(lastPts, false)
    return
  }
  if (preset === 'universe') {
    const loc = locations.find((l) => l.id === 'andromeda')
    const p = getLocationPosition(loc)
    const dirA = new THREE.Vector3(p.x, p.y, p.z).normalize()
    const viewDir = dirA.clone().multiplyScalar(-1)
    flyTo(new THREE.Vector3(0, 0, 0), 3.2e6, viewDir, 1500)
    return
  }
  const p = SCALE_PRESETS[preset]
  if (!p) return
  flyTo(new THREE.Vector3(...p.target), p.dist, new THREE.Vector3(...p.dir), 1200)
}

function zoomBy(factor) {
  if (!camera || !controls) return
  const off = camera.position.clone().sub(controls.target)
  const baseDist = tweenState.active
    ? tweenState.dist1
    : Math.max(off.length(), 1e-9)
  const baseDir = tweenState.active
    ? tweenState.dir1.clone()
    : (off.lengthSq() > 0 ? off.normalize() : new THREE.Vector3(0, 0, 1))
  const dist = baseDist * factor
  const clamped = Math.min(controls.maxDistance, Math.max(controls.minDistance, dist))
  flyTo(controls.target.clone(), clamped, baseDir, 240)
}

function resetView() {
  if (lastPts) frameCamera(lastPts, false)
}

function onControlsStart() {
  emit('map-interact')
}

function onContextMenu(e) {
  e.preventDefault()
}

function fade(v, a, b) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)))
}

function setOpacity(root, o) {
  if (!root) return
  root.traverse((obj) => {
    if (!obj.material) return
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    mats.forEach((m) => {
      if (m.userData.baseOpacity === undefined) {
        m.userData.baseOpacity = m.opacity === undefined ? 1 : m.opacity
      }
      m.transparent = true
      m.opacity = m.userData.baseOpacity * o
    })
  })
}

function updateLOD() {
  if (!camera) return
  const d = camera.position.distanceTo(controls.target)

  // 太阳系：只在恒星尺度以内可见，放大到星际后淡出
  const solarO = 1 - fade(d, 1.2, 6)
  setOpacity(solarGroup, solarO)
  const hideNames = new Set([props.origin.name, props.destination.name])
  planetLabels.forEach((l) => {
    const nm = l.userData && l.userData.name
    l.visible = solarO > 0.2 && !hideNames.has(nm)
  })

  planetMeshes.forEach((p) => {
    const dd = camera.position.distanceTo(p.mesh.position)
    const desired = dd * 0.006
    const r = Math.min(p.capR, Math.max(p.realR, desired))
    p.mesh.scale.setScalar(r)
    if (p.ring) p.ring.scale.setScalar(r)
  })

  // 近邻恒星：到银河尺度后淡出（由银河系粒子代表）
  const starsO = 1 - fade(d, 600, 2600)
  setOpacity(starsGroup, starsO)

  // 银河盘面/核心：只在银河系尺度显示
  const galaxyO = fade(d, 60, 400)
  if (galaxyDisk) {
    const dCenter = camera.position.distanceTo(new THREE.Vector3(GALAXY_CENTER_LY, 0, 0))
    const outside = dCenter > 62000 ? 1 : 0
    galaxyDisk.material.opacity = 0.92 * galaxyO * outside
    galaxyDisk.visible = galaxyO > 0.02 && outside > 0
  }
  if (galaxyCore) galaxyCore.material.opacity = 0.14 * galaxyO

  // 宇宙尺度：缩出银河系后淡入其他星系
  const uniO = fade(d, 1.5e5, 8e5)
  setOpacity(universeGroup, uniO)
  universeLabels.forEach((l) => {
    l.visible = uniO > 0.2
  })

  routeLabelObjs.forEach((l) => {
    l.visible = d < 1e5
  })

  let level = '银河系'
  if (d < 0.08) level = '太阳系'
  else if (d < 30) level = '恒星邻域'
  else if (d < 8000) level = '星际邻域'
  else if (d < 1e6) level = '银河系'
  else level = '宇宙尺度'
  if (zoomLevel.value !== level) zoomLevel.value = level
}

function initThree() {
  const el = containerEl.value
  const w = el.clientWidth
  const h = el.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.setClearColor(0x04060f, 1)
  el.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(w, h)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0'
  labelRenderer.domElement.style.left = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelsEl.value.appendChild(labelRenderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(52, w / h, 1e-6, 1e6)
  camera.position.set(0, 2, 4)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.rotateSpeed = 0.6
  controls.zoomSpeed = 1.1
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.35
  controls.minDistance = 1e-7
  controls.maxDistance = 1e10
  controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.PAN }
  controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }
  controls.addEventListener('start', onControlsStart)

  renderer.domElement.addEventListener('contextmenu', onContextMenu)

  galaxyGroup = buildGalaxy()
  scene.add(galaxyGroup)
  starsGroup = buildNearbyStars()
  scene.add(starsGroup)
  solarGroup = buildSolarSystem()
  scene.add(solarGroup)
  universeGroup = buildUniverse()
  scene.add(universeGroup)
  routeGroup = new THREE.Group()
  scene.add(routeGroup)

  rebuildRoute(true)

  const resize = () => {
    const nw = el.clientWidth
    const nh = el.clientHeight
    if (!nw || !nh) return
    camera.aspect = nw / nh
    camera.updateProjectionMatrix()
    renderer.setSize(nw, nh)
    labelRenderer.setSize(nw, nh)
    if (routeLine) routeLine.material.resolution.set(nw, nh)
    if (routeGlow) routeGlow.material.resolution.set(nw, nh)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  el.__ro = ro

  const animate = () => {
    if (disposed) return
    raf = requestAnimationFrame(animate)
    const now = performance.now()

    if (tweenState.active) {
      const t = Math.min(1, (now - tweenState.t0) / tweenState.dur)
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const target = tweenState.target0.clone().lerp(tweenState.target1, e)
      const dir = tweenState.dir0.clone().lerp(tweenState.dir1, e)
      if (dir.lengthSq() < 1e-12) dir.set(0, 0, 1)
      dir.normalize()
      const dist = Math.exp(
        THREE.MathUtils.lerp(Math.log(tweenState.dist0), Math.log(tweenState.dist1), e),
      )
      controls.target.copy(target)
      camera.position.copy(target).add(dir.multiplyScalar(dist))
      if (t >= 1) tweenState.active = false
    }

    if (launchT >= 0 && rocket) {
      const t = (now - launchStart) / 2200
      if (t >= 1) {
        launchT = -1
        rocket.visible = false
      } else {
        rocket.visible = true
        setRocketAt(t)
      }
    }

    const camDist = camera.position.distanceTo(controls.target)
    camera.near = Math.max(camDist * 0.0006, 1e-10)
    camera.far = Math.max(camDist * 15, maxExtent * 2.6, camDist > 1e5 ? 1e9 : 1e5)
    camera.updateProjectionMatrix()

    updateLOD()
    controls.update()
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
  }
  animate()
}

function startLaunch() {
  launchT = 0
  launchStart = performance.now()
}

watch(
  () => props.launchKey,
  (v) => {
    if (v > 0 && props.rocketFlying) startLaunch()
  },
)

watch(
  () => props.rocketFlying,
  (v) => {
    if (v) startLaunch()
    else if (rocket) {
      rocket.visible = !props.navigating
      if (!props.navigating) setRocketAt(0)
    }
  },
)

watch(
  () => [props.route.id, props.origin.id, props.destination.id, props.waypoints.map((w) => w.id).join(',')],
  () => {
    if (routeGroup) rebuildRoute(false)
  },
)

watch(
  () => [props.navigating, props.navProgress],
  () => {
    if (!rocket || !currentCurve) return
    if (props.navigating) {
      rocket.visible = true
      setRocketAt(props.navProgress)
    }
  },
)

function handleLocate() {
  spinning.value = false
  requestAnimationFrame(() => {
    spinning.value = true
    setTimeout(() => {
      spinning.value = false
    }, 700)
  })
  resetView()
  emit('locate')
}

onMounted(() => {
  initThree()
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  if (containerEl.value && containerEl.value.__ro) containerEl.value.__ro.disconnect()
  controls?.removeEventListener('start', onControlsStart)
  const dom = renderer?.domElement
  if (dom) dom.removeEventListener('contextmenu', onContextMenu)
  controls?.dispose()
  clearGroup(routeGroup)
  clearGroup(galaxyGroup)
  clearGroup(starsGroup)
  clearGroup(solarGroup)
  clearGroup(universeGroup)
  renderer?.dispose()
  renderer?.domElement?.remove()
  labelRenderer?.domElement?.remove()
})
</script>

<template>
  <div class="map">
    <div ref="containerEl" class="gl" />
    <div ref="labelsEl" class="labels" />

    <button class="immersive-btn" :class="{ active: immersive }" @click="emit('toggle-immersive')">
      <span v-if="immersive">⤡ 显示面板</span>
      <span v-else>⤢ 全屏地图</span>
    </button>

    <div class="scale-wrap">
      <button class="scale-chip" @click="scaleMenuOpen = !scaleMenuOpen">
        🔭 {{ zoomLevel }} <span class="caret">▾</span>
      </button>
      <transition name="pop">
        <div v-if="scaleMenuOpen" class="scale-menu">
          <button
            v-for="s in scaleOptions"
            :key="s.id"
            class="scale-item"
            :class="{ active: zoomLevel === s.label }"
            @click="selectScale(s.id)"
          >
            <span>{{ s.icon }}</span>
            <span>{{ s.label }}</span>
          </button>
        </div>
      </transition>
    </div>

    <div class="zoom-stack">
      <button class="zoom-btn preset" title="银河系" @click="jumpTo('galaxy')">🌌</button>
      <button class="zoom-btn preset" title="太阳系" @click="jumpTo('solar')">☀️</button>
      <button class="zoom-btn" title="放大" @click="zoomBy(0.55)">＋</button>
      <button class="zoom-btn" title="缩小" @click="zoomBy(1.8)">－</button>
      <button class="zoom-btn reset" title="适应航线" @click="resetView">⌖</button>
    </div>

    <div class="side-tools">
      <button class="tool" @click="emit('action', '实验室')">
        <span class="tool-ico">⚗️</span>
        <span class="tool-txt">实验室</span>
      </button>
      <button class="tool" @click="emit('action', '充能站')">
        <span class="tool-ico">🔋</span>
        <span class="tool-txt">充能站</span>
      </button>
      <button class="tool" @click="emit('action', '星图扫描')">
        <span class="tool-ico">🛰️</span>
        <span class="tool-txt">星图扫描</span>
      </button>
    </div>

    <button class="chip preference" @click="emit('preference')">
      <span>⚙️</span> 偏好
    </button>

    <button class="locate" :class="{ spin: spinning }" @click="handleLocate">
      <span class="locate-ring" />
      <span class="locate-dot" />
    </button>
  </div>
</template>

<style scoped>
.map {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #04060f;
}

.gl,
.labels {
  position: absolute;
  inset: 0;
}

.gl {
  touch-action: none;
}

.labels {
  pointer-events: none;
}

.labels :deep(.g-label) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.9), 0 0 6px rgba(90, 150, 255, 0.7);
  padding: 2px 6px;
  transform: translate(-50%, -140%);
}

.labels :deep(.g-dot) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px currentColor;
}

.labels :deep(.g-origin) {
  color: #b9ffd0;
}

.labels :deep(.g-dest) {
  color: #ffd0d0;
  font-weight: 700;
}

.labels :deep(.g-waypoint) {
  color: #bcd8ff;
  font-size: 11px;
}

.labels :deep(.g-galaxy) {
  color: #cfd8ff;
  font-size: 11px;
  opacity: 0.85;
}

.labels :deep(.g-sun) {
  color: #ffe08a;
  font-weight: 700;
}

.labels :deep(.g-planet) {
  color: #cfe0ff;
  font-size: 11px;
  opacity: 0.9;
}

.immersive-btn {
  position: absolute;
  top: 52px;
  right: 12px;
  z-index: 6;
  padding: 7px 12px;
  border-radius: 12px;
  background: rgba(11, 19, 56, 0.72);
  border: 1px solid rgba(120, 160, 255, 0.25);
  backdrop-filter: blur(8px);
  color: #dfe8ff;
  font-size: 12px;
  font-weight: 600;
  transition: transform 0.15s ease, background 0.2s ease;
}

.immersive-btn:active {
  transform: scale(0.94);
}

.immersive-btn.active {
  background: linear-gradient(135deg, #37b6ff, #1677ff);
  color: #fff;
  border-color: transparent;
}

.scale-wrap {
  position: absolute;
  top: 52px;
  left: 12px;
  z-index: 7;
}

.scale-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: 12px;
  background: rgba(11, 19, 56, 0.72);
  border: 1px solid rgba(120, 160, 255, 0.25);
  backdrop-filter: blur(8px);
  color: #dfe8ff;
  font-size: 12px;
  font-weight: 600;
  transition: transform 0.15s ease;
}

.scale-chip:active {
  transform: scale(0.95);
}

.caret {
  font-size: 10px;
  opacity: 0.7;
}

.scale-menu {
  position: absolute;
  top: 38px;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(10, 16, 40, 0.95);
  border: 1px solid rgba(140, 175, 255, 0.25);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  min-width: 132px;
}

.scale-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 9px;
  color: #dfe8ff;
  font-size: 12.5px;
  text-align: left;
  transition: background 0.15s ease;
}

.scale-item:active,
.scale-item.active {
  background: rgba(43, 140, 255, 0.85);
  color: #fff;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

.zoom-stack {
  position: absolute;
  right: 12px;
  bottom: 74px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zoom-btn {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: #fff;
  color: #1a2233;
  font-size: 20px;
  font-weight: 700;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease;
}

.zoom-btn:active {
  transform: scale(0.9);
}

.zoom-btn.preset {
  font-size: 18px;
}

.zoom-btn.reset {
  font-size: 17px;
}

.side-tools {
  position: absolute;
  right: 12px;
  top: 33%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool {
  width: 56px;
  padding: 8px 4px 6px;
  border-radius: 14px;
  background: rgba(11, 19, 56, 0.72);
  border: 1px solid rgba(120, 160, 255, 0.25);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: transform 0.15s ease, background 0.2s ease;
}

.tool:active {
  transform: scale(0.92);
  background: rgba(40, 80, 180, 0.8);
}

.tool-ico {
  font-size: 20px;
}

.tool-txt {
  font-size: 10px;
  color: #dfe8ff;
}

.chip {
  position: absolute;
  bottom: 16px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 14px;
  background: #fff;
  color: #1a2233;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease;
}

.chip:active {
  transform: scale(0.94);
}

.locate {
  position: absolute;
  bottom: 16px;
  right: 14px;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease;
}

.locate:active {
  transform: scale(0.92);
}

.locate-ring {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #1a2233;
  position: relative;
}

.locate-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1677ff;
}

.locate.spin {
  animation: spin 0.7s ease;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
