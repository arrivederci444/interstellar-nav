<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  categories,
  formatDistance,
  getLocation,
  hotIds,
  locations,
  searchLocations,
  typeMeta,
} from '../data/galaxy.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  originName: { type: String, default: '我的位置' },
  mode: { type: String, default: 'destination' },
  selectedId: { type: String, default: '' },
})

const emit = defineEmits(['close', 'select'])

const query = ref('')
const activeCat = ref('all')
const inputEl = ref(null)
const catsEl = ref(null)
const history = ref(loadHistory())

function onCatsWheel(e) {
  if (catsEl.value) catsEl.value.scrollLeft += e.deltaY + e.deltaX
}

function loadHistory() {
  try {
    const raw = localStorage.getItem('interstellar-history')
    return raw ? JSON.parse(raw) : ['地球', '比邻星', '猎户座大星云']
  } catch {
    return ['地球', '比邻星', '猎户座大星云']
  }
}

function saveHistory(name) {
  const next = [name, ...history.value.filter((n) => n !== name)].slice(0, 6)
  history.value = next
  try {
    localStorage.setItem('interstellar-history', JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

const results = computed(() => searchLocations(query.value, activeCat.value))
const hotList = computed(() => hotIds.map(getLocation))
const historyList = computed(() =>
  history.value.map((name) => locations.find((l) => l.name === name)).filter(Boolean),
)

const webResults = ref([])
const webLoading = ref(false)
let webTimer = null

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').trim()
}

function parseDistance(text) {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(万)?\s*光年/)
  if (!m) return null
  const v = parseFloat(m[1]) * (m[2] ? 10000 : 1)
  return v > 0 ? v : null
}

async function fetchWeb(q) {
  if (!q.trim()) {
    webResults.value = []
    return
  }
  webLoading.value = true
  try {
    const url =
      'https://zh.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=6&srsearch=' +
      encodeURIComponent(q)
    const res = await fetch(url)
    const data = await res.json()
    const list = (data && data.query && data.query.search) || []
    webResults.value = list.map((r) => {
      const desc = stripHtml(r.snippet)
      return {
        id: 'web-' + r.pageid,
        name: r.title,
        type: 'special',
        distance: parseDistance(desc) || 100,
        desc: desc.slice(0, 40) || '维基百科条目',
        alias: [],
        fromWeb: true,
      }
    })
  } catch {
    webResults.value = []
  } finally {
    webLoading.value = false
  }
}

watch(query, (q) => {
  clearTimeout(webTimer)
  webTimer = setTimeout(() => fetchWeb(q), 450)
})

const isOrigin = computed(() => props.mode === 'origin')
const isWaypoint = computed(() => props.mode === 'waypoint')
const placeholder = computed(() => {
  if (isOrigin.value) return '搜索银河系内的出发地'
  if (isWaypoint.value) return '搜索要经过的途经点'
  return '搜索银河系内的星球、星云、空间站…'
})
const resultTitle = computed(() => {
  if (isOrigin.value) return '出发地'
  if (isWaypoint.value) return '途经点'
  return '目的地'
})

watch(
  () => props.open,
  (v) => {
    if (v) {
      query.value = ''
      activeCat.value = 'all'
      nextTick(() => inputEl.value && inputEl.value.focus())
    }
  },
)

function pick(loc) {
  saveHistory(loc.name)
  emit('select', loc)
}

function meta(loc) {
  return typeMeta[loc.type] || typeMeta.special
}
</script>

<template>
  <transition name="search">
    <section v-if="open" class="search-panel">
      <header class="search-head">
        <button class="back" @click="emit('close')">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M15 5 L8 12 L15 19" fill="none" stroke="#1a2233" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="search-box">
          <span class="search-ico">🔍</span>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            :placeholder="placeholder"
          />
          <button v-if="query" class="clear" @click="query = ''">✕</button>
        </div>
      </header>

      <div ref="catsEl" class="cats" @wheel.prevent="onCatsWheel">
        <button
          v-for="c in categories"
          :key="c.id"
          class="cat"
          :class="{ active: c.id === activeCat }"
          @click="activeCat = c.id"
        >
          {{ c.label }}
        </button>
      </div>

      <div class="body">
        <template v-if="query || activeCat !== 'all'">
          <p class="section-title">
            {{ resultTitle }} · {{ results.length }} 个结果
          </p>
          <ul v-if="results.length" class="list">
            <li v-for="loc in results" :key="loc.id" class="item" @click="pick(loc)">
              <span class="ico" :style="{ background: meta(loc).color + '22', color: meta(loc).color }">
                {{ meta(loc).icon }}
              </span>
              <span class="info">
                <span class="name">{{ loc.name }}</span>
                <span class="sub">{{ meta(loc).label }} · {{ loc.desc }}</span>
              </span>
              <span v-if="loc.id === selectedId" class="check">✓</span>
              <span class="dist">{{ formatDistance(loc.distance) }}</span>
            </li>
          </ul>
          <p v-else class="empty">没有找到「{{ query }}」，换个星际坐标试试 🛸</p>

          <div v-if="query" class="web-section">
            <p class="section-title">
              🌐 联网搜索 <span class="web-src">维基百科</span>
            </p>
            <p v-if="webLoading" class="web-loading">正在联网检索…</p>
            <ul v-else-if="webResults.length" class="list">
              <li v-for="loc in webResults" :key="loc.id" class="item" @click="pick(loc)">
                <span class="ico" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8">🌐</span>
                <span class="info">
                  <span class="name">{{ loc.name }}</span>
                  <span class="sub">{{ loc.desc }}</span>
                </span>
                <span class="dist">{{ formatDistance(loc.distance) }}</span>
              </li>
            </ul>
            <p v-else class="web-empty">没有联网结果</p>
          </div>
        </template>

        <template v-else>
          <p class="section-title">热门目的地</p>
          <div class="hot-grid">
            <button v-for="loc in hotList" :key="loc.id" class="hot-card" @click="pick(loc)">
              <span class="hot-ico">{{ meta(loc).icon }}</span>
              <span class="hot-name">{{ loc.name }}</span>
              <span class="hot-dist">{{ formatDistance(loc.distance) }}</span>
            </button>
          </div>

          <template v-if="historyList.length">
            <p class="section-title">最近搜索</p>
            <ul class="list">
              <li v-for="loc in historyList" :key="loc.id" class="item" @click="pick(loc)">
                <span class="ico" :style="{ background: meta(loc).color + '22', color: meta(loc).color }">
                  {{ meta(loc).icon }}
                </span>
                <span class="info">
                  <span class="name">{{ loc.name }}</span>
                  <span class="sub">{{ meta(loc).label }} · {{ loc.desc }}</span>
                </span>
                <span v-if="loc.id === selectedId" class="check">✓</span>
                <span class="dist">{{ formatDistance(loc.distance) }}</span>
              </li>
            </ul>
          </template>
        </template>
      </div>
    </section>
  </transition>
</template>

<style scoped>
.search-panel {
  position: absolute;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  background: #f6f8fc;
}

.search-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 52px 14px 10px;
  background: #fff;
}

.back {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.back:active {
  background: rgba(0, 0, 0, 0.05);
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 12px;
  border-radius: 14px;
  background: #f0f3f9;
}

.search-ico {
  font-size: 15px;
  opacity: 0.7;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1a2233;
}

.search-box input::placeholder {
  color: #9aa4b6;
}

.clear {
  color: #9aa4b6;
  font-size: 13px;
}

.cats {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 10px 14px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: #fff;
  border-bottom: 1px solid #eef1f7;
}

.cats::-webkit-scrollbar {
  display: none;
}

.cat {
  flex: 0 0 auto;
  padding: 6px 14px;
  border-radius: 20px;
  background: #f0f3f9;
  color: #5a6478;
  font-size: 13px;
  transition: all 0.18s ease;
}

.cat.active {
  background: #e6f0ff;
  color: #1677ff;
  font-weight: 700;
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.section-title {
  margin: 4px 2px 10px;
  font-size: 13px;
  font-weight: 700;
  color: #8a94a6;
  letter-spacing: 0.5px;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

.hot-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 4px 8px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(20, 40, 90, 0.06);
  transition: transform 0.15s ease;
}

.hot-card:active {
  transform: scale(0.94);
}

.hot-ico {
  font-size: 20px;
}

.hot-name {
  font-size: 12px;
  font-weight: 600;
  color: #1a2233;
  white-space: nowrap;
}

.hot-dist {
  font-size: 10px;
  color: #9aa4b6;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(20, 40, 90, 0.05);
  transition: transform 0.15s ease;
}

.item:active {
  transform: scale(0.98);
}

.ico {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: #1a2233;
}

.sub {
  font-size: 12px;
  color: #8a94a6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dist {
  font-size: 12px;
  font-weight: 600;
  color: #1677ff;
  white-space: nowrap;
}

.check {
  font-size: 13px;
  font-weight: 700;
  color: #22c55e;
}

.empty {
  margin-top: 60px;
  text-align: center;
  color: #9aa4b6;
  font-size: 14px;
}

.web-section {
  margin-top: 18px;
}

.web-src {
  font-size: 11px;
  font-weight: 400;
  color: #9aa4b6;
}

.web-loading,
.web-empty {
  margin: 8px 2px;
  font-size: 12.5px;
  color: #9aa4b6;
}

.search-enter-active,
.search-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}
.search-enter-from,
.search-leave-to {
  transform: translateY(100%);
  opacity: 0.6;
}
</style>
